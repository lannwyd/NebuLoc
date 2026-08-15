import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useLang } from './context/LanguageContext'
import { t } from './lang/translations'

export function PasswordGate({ children }) {
    const [unlocked, setUnlocked] = useState(false);
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
    const [correctPassword, setCorrectPassword] = useState(null);
    const { lang } = useLang();

    useEffect(() => {
        window.electron.ipcRenderer.invoke('get-dashboard-password').then(setCorrectPassword);
    }, []);

    if (unlocked) return children;

    function handleSubmit(e) {
        e.preventDefault();
        if (input === correctPassword) {
            setUnlocked(true);
            setError(false);
        } else {
            setError(true);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Lock className="text-indigo-400" size={40} />
            <p className="text-gray-600 font-medium">{t[lang].enterPassword}</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 items-center">
                <input
                    type="password"
                    autoFocus
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(false); }}
                    className={`border rounded-lg p-2 text-sm text-center ${error ? "border-red-400" : "border-gray-200"}`}
                    placeholder="••••"
                />
                {error && <p className="text-red-500 text-xs">{t[lang].wrongPassword}</p>}
                <button
                    type="submit"
                    className="bg-indigo-400 text-white rounded-lg py-2 px-6 hover:bg-indigo-500">
                    {t[lang].unlock}
                </button>
            </form>
        </div>
    );
}