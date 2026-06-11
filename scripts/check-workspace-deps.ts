import { builtinModules } from "node:module";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  dependencyCheckIgnorePaths?: string[];
};

const ROOT_DIR = process.cwd();
const INCLUDED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mts",
  ".cts",
  ".mjs",
  ".cjs",
]);
const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".next",
  "dev-dist",
  "drizzle",
  "public",
]);
const IGNORED_PREFIXES = [
  ".",
  "/",
  "@/",
  "~/",
  "#",
  "http://",
  "https://",
  "data:",
  "app://",
  "plugin://",
];
const IMPORT_PATTERNS = [
  /\bimport\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
  /\bexport\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
  /\brequire\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /\bimport\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
];
const BUILT_INS = new Set([
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
  "bun",
]);

async function main() {
  const rootPackage = await loadJson<{
    workspaces?: string[];
  }>(path.join(ROOT_DIR, "package.json"));
  const workspaceDirs = await resolveWorkspaceDirs(
    rootPackage.workspaces ?? [],
  );
  const workspacePackages = await Promise.all(
    workspaceDirs.map(async (dir) => {
      const packageJsonPath = path.join(dir, "package.json");
      const packageJson = await loadJson<PackageJson>(packageJsonPath);

      return {
        dir,
        packageJsonPath,
        packageJson,
      };
    }),
  );

  const missingByPackage = new Map<
    string,
    {
      dir: string;
      files: Map<string, Set<string>>;
    }
  >();

  for (const workspacePackage of workspacePackages) {
    const packageName =
      workspacePackage.packageJson.name ?? path.basename(workspacePackage.dir);
    const declaredDeps = new Set([
      ...Object.keys(workspacePackage.packageJson.dependencies ?? {}),
      ...Object.keys(workspacePackage.packageJson.devDependencies ?? {}),
      ...Object.keys(workspacePackage.packageJson.peerDependencies ?? {}),
      ...Object.keys(workspacePackage.packageJson.optionalDependencies ?? {}),
    ]);

    const files = await collectSourceFiles(
      workspacePackage.dir,
      workspacePackage.dir,
      workspacePackage.packageJson.dependencyCheckIgnorePaths ?? [],
    );

    for (const filePath of files) {
      const fileContents = await readFile(filePath, "utf8");
      const specifiers = extractSpecifiers(fileContents);

      for (const specifier of specifiers) {
        if (shouldIgnoreSpecifier(specifier)) {
          continue;
        }

        const dependencyName = getDependencyName(specifier);
        if (
          !dependencyName ||
          BUILT_INS.has(dependencyName) ||
          declaredDeps.has(dependencyName)
        ) {
          continue;
        }

        const packageMissing = missingByPackage.get(packageName) ?? {
          dir: workspacePackage.dir,
          files: new Map<string, Set<string>>(),
        };
        const fileMissing =
          packageMissing.files.get(filePath) ?? new Set<string>();
        fileMissing.add(dependencyName);
        packageMissing.files.set(filePath, fileMissing);
        missingByPackage.set(packageName, packageMissing);
      }
    }
  }

  if (missingByPackage.size === 0) {
    console.log("Workspace dependency check passed");
    return;
  }

  console.error("Workspace dependency check failed.\n");

  for (const [packageName, details] of missingByPackage) {
    console.error(`${packageName} (${path.relative(ROOT_DIR, details.dir)})`);

    for (const [filePath, deps] of details.files) {
      const relativeFilePath = path.relative(ROOT_DIR, filePath);
      const missingDeps = [...deps].sort().join(", ");
      console.error(`  - ${relativeFilePath}: ${missingDeps}`);
    }

    console.error("");
  }

  console.error(
    "Add each missing package to the importing workspace's package.json before installing.",
  );
  process.exit(1);
}

async function resolveWorkspaceDirs(workspaces: string[]) {
  const dirs: string[] = [];

  for (const workspace of workspaces) {
    if (!workspace.endsWith("/*")) {
      const workspaceDir = path.join(ROOT_DIR, workspace);
      if (await exists(path.join(workspaceDir, "package.json"))) {
        dirs.push(workspaceDir);
      }
      continue;
    }

    const parentDir = path.join(ROOT_DIR, workspace.slice(0, -2));
    if (!(await exists(parentDir))) {
      continue;
    }

    const entries = await readdir(parentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dir = path.join(parentDir, entry.name);
      if (await exists(path.join(dir, "package.json"))) {
        dirs.push(dir);
      }
    }
  }

  return dirs.sort();
}

async function collectSourceFiles(
  dir: string,
  packageDir: string,
  ignorePaths: string[],
) {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }

      if (
        entryPath !== packageDir &&
        (await exists(path.join(entryPath, "package.json")))
      ) {
        continue;
      }

      files.push(
        ...(await collectSourceFiles(entryPath, packageDir, ignorePaths)),
      );
      continue;
    }

    if (!INCLUDED_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const relativeFilePath = path.relative(packageDir, entryPath);
    if (
      ignorePaths.some((ignoredPath) =>
        relativeFilePath.startsWith(ignoredPath),
      )
    ) {
      continue;
    }

    files.push(entryPath);
  }

  return files;
}

function extractSpecifiers(source: string) {
  const specifiers = new Set<string>();

  for (const pattern of IMPORT_PATTERNS) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1]?.trim();
      if (specifier) {
        specifiers.add(specifier);
      }
    }
  }

  return specifiers;
}

function shouldIgnoreSpecifier(specifier: string) {
  return IGNORED_PREFIXES.some((prefix) => specifier.startsWith(prefix));
}

function getDependencyName(specifier: string) {
  if (specifier.startsWith("node:")) {
    return specifier;
  }

  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/");
    return scope && name ? `${scope}/${name}` : specifier;
  }

  const [name] = specifier.split("/");
  return name;
}

async function exists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadJson<T>(filePath: string): Promise<T> {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

await main();
