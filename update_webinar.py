import re

with open('app/webinar/page.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace('MessageCircle\n}', 'MessageCircle, X\n}')

# 2. Add Context
context_code = """
/* ---- Modal Context --------------------------------------------------------- */
const ModalContext = React.createContext({ isOpen: false, open: () => {}, close: () => {} });
"""
content = content.replace('/* ---- Design tokens', context_code + '\n/* ---- Design tokens')

# 3. Update RegisterButton
old_register_btn = """function RegisterButton({ children, large, className = "" }: { children: React.ReactNode; large?: boolean; className?: string }) {
  return (
    <a
      href="#register"
      className={`group inline-flex items-center justify-center gap-2 font-extrabold transition-all duration-200 active:scale-[0.97] ${large ? "px-10 py-5 rounded-2xl text-lg md:text-xl" : "px-8 py-4 rounded-xl text-base"} ${className}`}"""
      
new_register_btn = """function RegisterButton({ children, large, className = "" }: { children: React.ReactNode; large?: boolean; className?: string }) {
  const { open } = React.useContext(ModalContext);
  return (
    <button
      onClick={open}
      className={`group inline-flex items-center justify-center gap-2 font-extrabold transition-all duration-200 active:scale-[0.97] ${large ? "px-10 py-5 rounded-2xl text-lg md:text-xl" : "px-8 py-4 rounded-xl text-base"} ${className}`}"""

content = content.replace(old_register_btn, new_register_btn)
content = content.replace('      <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2.5} />\n    </a>', '      <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={2.5} />\n    </button>')

# 4. Update Nav
old_nav_a = """<a
          href="#register"
          className="text-xs md:text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200"
          style={{ ...MF, background: `${C.blue}18`, color: C.glow, border: `1px solid ${C.blue}30` }}
        >
          שמור מקום
        </a>"""
new_nav_btn = """<NavButton />"""

nav_component = """function Nav() {
  return ("""
new_nav_component = """function NavButton() {
  const { open } = React.useContext(ModalContext);
  return (
    <button
      onClick={open}
      className="text-xs md:text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200"
      style={{ ...MF, background: `${C.blue}18`, color: C.glow, border: `1px solid ${C.blue}30` }}
    >
      שמור מקום
    </button>
  );
}

function Nav() {
  return ("""

content = content.replace(nav_component, new_nav_component)
content = content.replace(old_nav_a, new_nav_btn)

# 5. Update RegisterForm to RegisterModal
content = content.replace('function RegisterForm() {', 'function RegisterModal() {\n  const { isOpen, close } = React.useContext(ModalContext);\n')

old_section = """<Section id="register" bg={C.bg}>
      <Orb color={C.blue} x="50%" y="30%" size={680} opacity={0.14} />
      <div className="max-w-lg mx-auto relative z-10">"""

new_modal_wrapper = """if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in duration-200">
        <button onClick={close} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="rounded-2xl relative overflow-hidden" style={{ backgroundColor: C.bg, border: `1px solid ${C.outline}` }}>
          <Orb color={C.blue} x="50%" y="30%" size={680} opacity={0.14} />
          <div className="relative z-10 p-6 md:p-8">"""

content = content.replace(old_section, new_modal_wrapper)

old_section_close = """          </form>
        )}
      </div>
    </Section>"""

new_modal_close = """          </form>
        )}
          </div>
        </div>
      </div>
    </div>"""

content = content.replace(old_section_close, new_modal_close)

# 6. Update WebinarPage
old_page = """export default function WebinarPage() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} dir="rtl" style={{ backgroundColor: C.bg, minHeight: "100vh" }}>"""

new_page = """export default function WebinarPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      <div ref={ref} dir="rtl" style={{ backgroundColor: C.bg, minHeight: "100vh" }}>"""

content = content.replace(old_page, new_page)
content = content.replace('<RegisterForm />', '')
content = content.replace('<Footer />', '<Footer />\n      <RegisterModal />')
content = content.replace('    </div>\n  );\n}', '      </div>\n    </ModalContext.Provider>\n  );\n}')

with open('app/webinar/page.tsx', 'w') as f:
    f.write(content)
