import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const AuthErrorPage = () => {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error") || "unknown_error";
  const description = params.get("error_description");

  const message =
    error === "email_not_found"
      ? "GitHub didn’t return an email for this account. If you’re using a GitHub App, enable the “Email addresses” permission and re-authorize. You can also make sure you grant email access during sign-in."
      : "We encountered an unexpected error. Please try again or return to the home page.";

  return (
    <div className="h-[100vh] w-[80%] lg:w-[520px] mx-auto text-center flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl mb-4">ERROR</h1>
      <p className="text-sm text-gray-400 mb-6">{message}</p>

      <div className="w-full bg-gray-900/30 border border-gray-800 rounded-xl p-4 text-left">
        <p className="text-xs text-gray-400">CODE:</p>
        <p className="font-mono text-sm break-all">{error}</p>
        {description ? (
          <>
            <p className="mt-3 text-xs text-gray-400">DETAILS:</p>
            <p className="font-mono text-sm break-all">{description}</p>
          </>
        ) : null}
      </div>

      <div className="pt-6 w-full">
        <Link to="/" className="w-full block">
          <Button className="w-full">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default AuthErrorPage;
