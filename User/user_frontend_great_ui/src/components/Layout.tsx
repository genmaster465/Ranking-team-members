import { Fragment, ReactNode, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MoonIcon, SunIcon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/solid'
import { Menu, Transition } from '@headlessui/react'

type Props = {
  me: any
  children: ReactNode
  onLogout?: () => void
  isAuthed?: boolean             // ⬅️ NEW
}

export default function Layout({ me, children, onLogout, isAuthed }: Props){
  const location = useLocation()
  const navigate = useNavigate()
  const active = (p:string)=> location.pathname===p ? 'text-white' : 'text-white/80 hover:text-white'
  const [dark, setDark] = useState(()=> localStorage.getItem('theme')==='dark')

  useEffect(()=>{
    const root = document.documentElement
    if(dark){ root.classList.add('dark'); localStorage.setItem('theme','dark') }
    else { root.classList.remove('dark'); localStorage.setItem('theme','light') }
  }, [dark])

  const handleLogoutClick = () => {
    onLogout?.()
    navigate('/login')
  }

  // ⬇️ Helper renders a disabled nav item when logged out
  const NavItem = ({ to, children }: { to: string; children: ReactNode }) => {
    if (!isAuthed) {
      return (
        <span
          className="text-white/50 cursor-not-allowed select-none px-1"
          aria-disabled="true"
          title="Login to access"
        >
          {children}
        </span>
      )
    }
    return <Link className={active(to)} to={to}>{children}</Link>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-gradient-to-r from-sky-500 to-violet-600 shadow-soft">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <nav className="space-x-6">
            <NavItem to="/users">Users</NavItem>
            <NavItem to="/templates">Templates</NavItem>
            <NavItem to="/rate">Rate</NavItem>
            <NavItem to="/history">History</NavItem>
            <NavItem to="/leaderboard">Leaderboard</NavItem>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={()=>setDark(v=>!v)} className="text-white/90">
              {dark ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
            </button>

            {isAuthed && me ? (
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-white hover:bg-white/20">
                  <span className="truncate max-w-[160px]">{me.name || me.email}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white shadow-soft ring-1 ring-black/5 focus:outline-none">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogoutClick}
                            className={`${active ? 'bg-slate-100' : ''} group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-white hover:bg-white/20"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  )
}
