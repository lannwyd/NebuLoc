import Comp from './Comp';
import { useLang } from './context/LanguageContext'

function App() {
  const { lang } = useLang();

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      <Comp />
    </div>
  )
}

export default App;