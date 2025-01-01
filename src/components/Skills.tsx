import { FC } from 'react'
import { Star, StarHalf } from 'lucide-react'

const SkillLevel: FC<{ level: number }> = ({ level }) => {
  const fullStars = Math.floor(level)
  const hasHalfStar = level % 1 !== 0

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        } else {
          return <Star key={i} className="w-5 h-5 text-gray-600" />
        }
      })}
    </div>
  )
}

const SkillItem: FC<{ name: string; level: number }> = ({ name, level }) => (
  <div className="flex justify-between items-center mb-4">
    <span className="font-medium text-gray-300">{name}</span>
    <SkillLevel level={level} />
  </div>
)

const SkillCategory: FC<{ title: string; skills: { name: string; level: number }[] }> = ({ title, skills }) => (
  <div className="mb-8">
    <h3 className="text-2xl font-semibold mb-4 text-blue-400">{title}</h3>
    {skills.map((skill) => (
      <SkillItem key={skill.name} name={skill.name} level={skill.level} />
    ))}
  </div>
)

const Skills: FC = () => {
  const skillCategories = [
    {
      title: "Web Development",
      skills: [
        { name: "HTML", level: 4.5 },
        { name: "CSS", level: 4 },
        { name: "JavaScript", level: 4.5 },
        { name: "React", level: 4 },
        { name: "TypeScript", level: 4 },
      ]
    },
    {
      title: "Data Science",
      skills: [
        { name: "Python", level: 5 },
        { name: "NumPy", level: 4 },
        { name: "Pandas", level: 4.5 },
        { name: "Scikit-learn", level: 4 },
      ]
    },
    {
      title: "Control Systems",
      skills: [
        { name: "MATLAB", level: 4.5 },
        { name: "Simulink", level: 4 },
        { name: "PID Control", level: 4.5 },
        { name: "State-space modeling", level: 4 },
      ]
    },
    {
      title: "Other Skills",
      skills: [
        { name: "Problem Solving", level: 5 },
        { name: "Backend Development", level: 4 },
        { name: "Git", level: 4.5 },
        { name: "Linux", level: 4 },
      ]
    }
  ]

  return (
    <section id="skills" className="py-20 opacity-0 transition-opacity duration-1000 ease-in-out">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-400">Skills</h2>
        {skillCategories.map((category) => (
          <SkillCategory key={category.title} title={category.title} skills={category.skills} />
        ))}
      </div>
    </section>
  )
}

export default Skills

