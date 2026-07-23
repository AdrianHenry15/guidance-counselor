import { AcademicProgram } from "@/types/degree.type"

export const computerScienceBachelorProgram: AcademicProgram = {
  id: "bachelor-computer_science",
  name: "Bachelor's Degree in Computer Science",
  level: "college",
  credential: "bachelor",
  totalCredits: 120,
  requirements: [
    {
      id: "college-writing",
      title: "College Writing",
      description:
        "Introductory and advanced written communication coursework.",
      type: "specific_course",
      requiredCredits: 6,
      minimumCourses: 2,
      courseOptions: [
        {
          id: "english-composition-1",
          title: "English Composition I",
          description:
            "Foundational college writing, research, and composition.",
          subjectArea: "english",
          credits: 3,
          level: "college",
          difficulty: "introductory",
        },
        {
          id: "english-composition-2",
          title: "English Composition II",
          description: "Research-based writing and advanced composition.",
          subjectArea: "english",
          credits: 3,
          level: "college",
          difficulty: "introductory",
          prerequisites: ["english-composition-1"],
        },
      ],
    },
    {
      id: "mathematics-foundation",
      title: "Mathematics Foundation",
      description:
        "Calculus, discrete mathematics, statistics, and supporting mathematics.",
      type: "specific_course",
      requiredCredits: 15,
      minimumCourses: 5,
      courseOptions: [
        {
          id: "calculus-1",
          title: "Calculus I",
          description: "Limits, derivatives, integrals, and applications.",
          subjectArea: "mathematics",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
        },
        {
          id: "calculus-2",
          title: "Calculus II",
          description: "Advanced integration, sequences, and series.",
          subjectArea: "mathematics",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
          prerequisites: ["calculus-1"],
        },
        {
          id: "discrete-mathematics",
          title: "Discrete Mathematics",
          description:
            "Logic, proofs, sets, combinatorics, graphs, and discrete structures.",
          subjectArea: "mathematics",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
        },
        {
          id: "linear-algebra",
          title: "Linear Algebra",
          description:
            "Vectors, matrices, transformations, and linear systems.",
          subjectArea: "mathematics",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
        },
        {
          id: "statistics",
          title: "Statistics",
          description:
            "Probability, statistical analysis, and data interpretation.",
          subjectArea: "mathematics",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
        },
      ],
    },
    {
      id: "science-sequence",
      title: "Laboratory Science",
      description: "A sequence of college-level laboratory science courses.",
      type: "subject_credits",
      subjectArea: "science",
      requiredCredits: 8,
      minimumCourses: 2,
    },
    {
      id: "computer_science-foundation",
      title: "Computer Science Foundation",
      description:
        "Programming, software development, and computational problem solving.",
      type: "specific_course",
      requiredCredits: 12,
      minimumCourses: 4,
      courseOptions: [
        {
          id: "intro-programming",
          title: "Introductory Programming",
          description:
            "Programming fundamentals, variables, control flow, and functions.",
          subjectArea: "computer_science",
          credits: 3,
          level: "college",
          difficulty: "introductory",
        },
        {
          id: "object-oriented-programming",
          title: "Object-Oriented Programming",
          description:
            "Classes, objects, inheritance, interfaces, and software design.",
          subjectArea: "computer_science",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
          prerequisites: ["intro-programming"],
        },
        {
          id: "data-structures",
          title: "Data Structures and Algorithms",
          description:
            "Core data structures, algorithm design, and complexity.",
          subjectArea: "computer_science",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
          prerequisites: ["object-oriented-programming"],
        },
        {
          id: "computer-organization",
          title: "Computer Organization",
          description:
            "Computer architecture, memory, processors, and low-level systems.",
          subjectArea: "computer_science",
          credits: 3,
          level: "college",
          difficulty: "intermediate",
        },
      ],
    },
    {
      id: "computer_science-core",
      title: "Computer Science Core",
      description:
        "Upper-level study in systems, theory, databases, and software engineering.",
      type: "specific_course",
      requiredCredits: 18,
      minimumCourses: 6,
      courseOptions: [
        {
          id: "software-engineering",
          title: "Software Engineering",
          description:
            "Software lifecycle, architecture, testing, and team development.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
          prerequisites: ["data-structures"],
        },
        {
          id: "operating-systems",
          title: "Operating Systems",
          description:
            "Processes, memory, concurrency, file systems, and operating systems.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
          prerequisites: ["computer-organization"],
        },
        {
          id: "database-systems",
          title: "Database Systems",
          description:
            "Relational modeling, SQL, indexing, transactions, and database design.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
          prerequisites: ["data-structures"],
        },
        {
          id: "computer-networks",
          title: "Computer Networks",
          description:
            "Network architecture, protocols, routing, and distributed communication.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
        },
        {
          id: "theory-of-computation",
          title: "Theory of Computation",
          description:
            "Formal languages, automata, computability, and complexity.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
          prerequisites: ["discrete-mathematics"],
        },
        {
          id: "senior-capstone",
          title: "Computer Science Capstone",
          description:
            "A final project integrating software development and computer science.",
          subjectArea: "major_core",
          credits: 3,
          level: "college",
          difficulty: "advanced",
          prerequisites: [
            "software-engineering",
            "database-systems",
            "operating-systems",
          ],
        },
      ],
    },
    {
      id: "major-electives",
      title: "Computer Science Electives",
      description:
        "Advanced computer science courses selected around the student's interests.",
      type: "elective_credits",
      subjectArea: "major_elective",
      requiredCredits: 15,
      minimumCourses: 5,
    },
    {
      id: "general-education",
      title: "General Education",
      description:
        "Humanities, social science, communication, and other general education courses.",
      type: "subject_credits",
      requiredCredits: 30,
    },
    {
      id: "general-electives",
      title: "General Electives",
      description:
        "Additional coursework needed to reach the degree's total credit requirement.",
      type: "elective_credits",
      subjectArea: "general_elective",
      requiredCredits: 16,
    },
  ],
}
