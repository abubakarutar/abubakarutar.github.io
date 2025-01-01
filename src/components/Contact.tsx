import { Proportions } from 'lucide-react'
import { FC, useState } from 'react'

function Link({ websiteName, websiteLink }: { websiteName: string, websiteLink: string }) {
  return (
    <a
      href={websiteLink}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
    >
      {websiteName}
    </a>
  )
}

const Contact: FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would typically send the form data to a server
    alert('Thank you for your message!')
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="py-20 opacity-0 transition-opacity duration-1000 ease-in-out">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Contact Me</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Send Message
          </button>
        </form>
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4 text-center text-blue-400">Connect with me</h3>
          <div className="flex justify-center space-x-6">
            <Link websiteLink='https://github.com/abubakarutar' websiteName='Github' />
            <Link websiteLink='https://linkedin.com/in/abubakarutar' websiteName='LinkedIn' />
            <Link websiteLink='https://x.com/abubakarutar' websiteName='X' />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

