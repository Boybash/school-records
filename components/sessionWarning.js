export default function SessionWarning({ onStay, onLogout }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Session Expiring Soon
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          You have been inactive for a while. You will be automatically logged
          out in <span className="font-bold text-red-500">5 minutes</span> to
          keep your account secure.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onLogout}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
          >
            Logout Now
          </button>
          <button
            onClick={onStay}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-medium"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
