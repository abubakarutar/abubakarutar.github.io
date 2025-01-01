import { FC } from 'react'

const Header: FC = () => {
  const navItems = ['home', 'skills', 'contact']

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-4">
        <ul className="flex justify-center space-x-6">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item}`}
                className="capitalize text-gray-300 hover:text-blue-400 transition-colors duration-200"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header

