export default function UserNotRegisteredError() {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-6">
            <div className="glass-panel rounded-3xl p-8 max-w-md text-center">
                <h1 className="font-display text-2xl font-medium">Account not found</h1>
                <p className="mt-3 text-sm text-foreground/65">
                    Your account doesn't have access to this application. Please contact support.
                </p>
                <a href="/login" className="glass-btn label-mono mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-foreground">
                    Back to login
                </a>
            </div>
        </div>
    );
}
