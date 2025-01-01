import { FC } from 'react'

const Footer: FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Abubakar. All rights reserved.</p>
        <p className="mt-2 text-sm">Computer Engineering Student | Control Systems Specialist</p>
      </div>
    </footer>
  )
}

export default Footer

