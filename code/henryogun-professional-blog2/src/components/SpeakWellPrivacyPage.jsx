export default function SpeakWellPrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-gray-800">
      <div className="mb-8">
        <div className="inline-block bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Privacy Policy
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SpeakWell Privacy Policy</h1>
        <p className="text-gray-500 text-sm">Effective Date: 1 August 2026 &nbsp;&middot;&nbsp; Last Updated: 1 August 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed">

        <section>
          <p>
            SpeakWell ("the App") is developed and published by <strong>Onatham Technologies Limited</strong> (RC No. 9601836), a company registered in Nigeria. This Privacy Policy explains what information we collect, how we use it, and your rights as a user.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. Information We Collect</h2>
          <p className="mb-3">SpeakWell is designed to work <strong>fully offline</strong>. We do not require you to create an account or log in.</p>
          <p className="mb-2">The only data stored by SpeakWell is stored <strong>locally on your device</strong> and includes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your learning progress (lessons completed, XP earned, streaks)</li>
            <li>Vocabulary items you save to your Notebook</li>
            <li>Quiz scores and pronunciation practice records</li>
            <li>App settings (dark/light mode, daily goal preferences)</li>
          </ul>
          <p className="mt-3">We do <strong>not</strong> collect, transmit, or store any of this data on external servers.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Microphone Access</h2>
          <p>
            SpeakWell requests access to your device microphone solely for the purpose of pronunciation recording and speaking practice features within the App. Audio recordings are processed and stored <strong>locally on your device only</strong>. We never upload, stream, or transmit your voice recordings to any server.
          </p>
          <p className="mt-2">You can revoke microphone permission at any time through your device settings. The App will continue to function without microphone access, though recording features will be unavailable.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. Internet Access</h2>
          <p>
            SpeakWell requests internet permission in its Android manifest for potential future features. Currently, the App does not make any network requests and functions entirely offline. No data is sent to or received from the internet during normal use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Third-Party Services</h2>
          <p>
            SpeakWell does not integrate any third-party analytics, advertising networks, social login providers, or tracking SDKs. There are no in-app advertisements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Children's Privacy</h2>
          <p>
            SpeakWell is rated "Everyone" and is suitable for all ages. We do not knowingly collect personal information from children under the age of 13. Since no personal data is collected by the App at all, there is no risk of inadvertent collection of children's data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Data Security</h2>
          <p>
            Since all user data remains on your device, its security depends on your device's own security measures (screen lock, encryption, etc.). Uninstalling the App will permanently delete all locally stored data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. Your Rights</h2>
          <p className="mb-2">Because we do not collect or store your personal data on our servers, most data rights (access, deletion, portability) are exercised directly on your device:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Delete your data:</strong> Uninstall the App or clear App data in your device settings.</li>
            <li><strong>Revoke permissions:</strong> Remove microphone access via your device settings at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we introduce any data collection in future versions of the App, we will update this policy and notify users through the App or Play Store release notes. The effective date at the top of this page will always reflect the date of the latest revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-1">
            <p><strong>Onatham Technologies Limited</strong></p>
            <p>RC No. 9601836</p>
            <p>Nigeria</p>
            <p>Email: <a href="mailto:help@henryogun.com" className="text-sky-600 hover:underline">help@henryogun.com</a></p>
            <p>Website: <a href="https://www.henryogun.com" className="text-sky-600 hover:underline">www.henryogun.com</a></p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Onatham Technologies Limited. All rights reserved.
      </div>
    </div>
  );
}