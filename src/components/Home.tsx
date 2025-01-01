import { FC } from 'react'

const Home: FC = () => {
  return (
    <section id="home" className="py-20 opacity-0 transition-opacity duration-1000 ease-in-out">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 text-blue-400">Hello, I'm Abubakar</h1>
        <p className="text-xl mb-8">
          Computer Engineering Student | Control Systems Specialist
        </p>
        <p className="mb-6">
          I'm a computer engineering student specializing in control systems, with a strong foundation in Python and TypeScript.
          My focus is on backend development and solving complex logical problems.
        </p>
        <p className="mb-6">
          My interests span across electrical engineering, data science, IT, and entrepreneurship. I'm passionate about building
          apps that solve practical problems and enjoy the challenge of troubleshooting complex systems.
        </p>
        <p>
          When I'm not coding or studying, you can find me playing chess or exploring new technologies to expand my skill set.
        </p>
      </div>
    </section>
  )
}

export default Home

