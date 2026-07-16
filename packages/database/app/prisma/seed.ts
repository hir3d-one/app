import { PrismaClient } from "../generated/app-client";

const prisma = new PrismaClient();

const demoCandidates = [
  {
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@email.com",
    location: "Berlin, Germany",
    linkedinUrl: "https://linkedin.com/in/alexjohnson",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 5, importance: "HIGH" },
      { skill: "TypeScript", experience: 4, importance: "HIGH" },
      { skill: "Node.js", experience: 3, importance: "MEDIUM" },
      { skill: "GraphQL", experience: 2, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Senior Frontend Developer", company: "TechCorp", duration: "3 years", startDate: "2022-01", endDate: "2025-01" },
      { title: "Frontend Developer", company: "StartupXYZ", duration: "2 years", startDate: "2020-01", endDate: "2022-01" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Science", field: "Computer Science", institution: "Technical University Berlin", year: "2019" }
    ],
    aiTags: ["react", "typescript", "frontend", "senior", "agile", "team-lead"],
    aiSummary: "Experienced frontend developer with strong React and TypeScript skills. Led multiple successful projects and mentored junior developers.",
    overallRankingScore: 92.5
  },
  {
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@email.com",
    location: "London, UK",
    linkedinUrl: "https://linkedin.com/in/sarahwilson",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 6, importance: "HIGH" },
      { skill: "JavaScript", experience: 7, importance: "HIGH" },
      { skill: "CSS", experience: 6, importance: "HIGH" },
      { skill: "Redux", experience: 4, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Frontend Team Lead", company: "DesignCorp", duration: "2 years", startDate: "2023-01", endDate: "present" },
      { title: "Senior Frontend Developer", company: "WebSolutions", duration: "3 years", startDate: "2020-01", endDate: "2023-01" }
    ],
    aiExtractedEducation: [
      { degree: "Master of Science", field: "Human-Computer Interaction", institution: "University College London", year: "2019" }
    ],
    aiTags: ["react", "javascript", "css", "frontend", "team-lead", "ux"],
    aiSummary: "Frontend team lead with excellent UX sensibilities and strong technical skills. Experienced in leading cross-functional teams.",
    overallRankingScore: 89.3
  },
  {
    firstName: "Marcus",
    lastName: "Chen",
    email: "marcus.chen@email.com",
    location: "Remote (GMT+8)",
    linkedinUrl: "https://linkedin.com/in/marcuschen",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 4, importance: "HIGH" },
      { skill: "Node.js", experience: 5, importance: "HIGH" },
      { skill: "MongoDB", experience: 4, importance: "MEDIUM" },
      { skill: "Express.js", experience: 5, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Full Stack Developer", company: "RemoteFirst", duration: "3 years", startDate: "2021-06", endDate: "present" },
      { title: "Backend Developer", company: "DataTech", duration: "2 years", startDate: "2019-06", endDate: "2021-06" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Engineering", field: "Software Engineering", institution: "National University of Singapore", year: "2018" }
    ],
    aiTags: ["react", "nodejs", "mongodb", "fullstack", "remote", "api"],
    aiSummary: "Full-stack developer with strong backend expertise. Excellent at building scalable APIs and working in distributed teams.",
    overallRankingScore: 87.1
  },
  {
    firstName: "Emma",
    lastName: "Rodriguez",
    email: "emma.rodriguez@email.com",
    location: "Barcelona, Spain",
    linkedinUrl: "https://linkedin.com/in/emmarodriguez",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React Native", experience: 3, importance: "HIGH" },
      { skill: "React", experience: 4, importance: "HIGH" },
      { skill: "TypeScript", experience: 3, importance: "MEDIUM" },
      { skill: "Redux", experience: 3, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Mobile Developer", company: "MobileFirst", duration: "2.5 years", startDate: "2022-01", endDate: "present" },
      { title: "Frontend Developer", company: "WebStudio", duration: "2 years", startDate: "2020-01", endDate: "2022-01" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Science", field: "Computer Science", institution: "Universitat Politècnica de Catalunya", year: "2019" }
    ],
    aiTags: ["react-native", "mobile", "react", "typescript", "ios", "android"],
    aiSummary: "Mobile developer specializing in React Native with strong cross-platform development skills. Excellent at building user-friendly mobile applications.",
    overallRankingScore: 85.7
  },
  {
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@email.com",
    location: "Seoul, South Korea",
    linkedinUrl: "https://linkedin.com/in/davidkim",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 3, importance: "HIGH" },
      { skill: "Vue.js", experience: 4, importance: "HIGH" },
      { skill: "JavaScript", experience: 5, importance: "HIGH" },
      { skill: "Sass", experience: 4, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Frontend Developer", company: "TechKorea", duration: "2 years", startDate: "2022-06", endDate: "present" },
      { title: "Junior Frontend Developer", company: "StartupSeoul", duration: "1.5 years", startDate: "2021-01", endDate: "2022-06" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Science", field: "Computer Science", institution: "Seoul National University", year: "2020" }
    ],
    aiTags: ["react", "vuejs", "javascript", "sass", "frontend", "multilingual"],
    aiSummary: "Frontend developer with experience in both React and Vue.js ecosystems. Strong attention to detail and excellent problem-solving skills.",
    overallRankingScore: 82.4
  },
  {
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@email.com",
    location: "Stockholm, Sweden",
    linkedinUrl: "https://linkedin.com/in/lisaanderson",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 7, importance: "HIGH" },
      { skill: "TypeScript", experience: 5, importance: "HIGH" },
      { skill: "GraphQL", experience: 4, importance: "MEDIUM" },
      { skill: "Apollo Client", experience: 3, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Senior Frontend Architect", company: "NordicTech", duration: "3 years", startDate: "2021-09", endDate: "present" },
      { title: "Frontend Team Lead", company: "SwedishStartup", duration: "2 years", startDate: "2019-09", endDate: "2021-09" }
    ],
    aiExtractedEducation: [
      { degree: "Master of Science", field: "Computer Science", institution: "KTH Royal Institute of Technology", year: "2018" }
    ],
    aiTags: ["react", "typescript", "graphql", "architecture", "senior", "scalability"],
    aiSummary: "Senior frontend architect with deep expertise in React and TypeScript. Excellent at designing scalable frontend architectures and mentoring teams.",
    overallRankingScore: 94.2
  },
  {
    firstName: "James",
    lastName: "Brown",
    email: "james.brown@email.com",
    location: "Toronto, Canada",
    linkedinUrl: "https://linkedin.com/in/jamesbrown",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 2, importance: "HIGH" },
      { skill: "JavaScript", experience: 3, importance: "HIGH" },
      { skill: "HTML/CSS", experience: 4, importance: "MEDIUM" },
      { skill: "Git", experience: 3, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Junior Frontend Developer", company: "CanadianTech", duration: "1.5 years", startDate: "2023-01", endDate: "present" },
      { title: "Frontend Intern", company: "WebDesignCorp", duration: "6 months", startDate: "2022-06", endDate: "2022-12" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Science", field: "Computer Science", institution: "University of Toronto", year: "2022" }
    ],
    aiTags: ["react", "javascript", "junior", "eager", "html", "css"],
    aiSummary: "Junior frontend developer with solid fundamentals and strong eagerness to learn. Good team player with attention to detail.",
    overallRankingScore: 75.8
  },
  {
    firstName: "Anna",
    lastName: "Mueller",
    email: "anna.mueller@email.com",
    location: "Munich, Germany",
    linkedinUrl: "https://linkedin.com/in/annamueller",
    cvSource: "CANDIDATE_UPLOAD",
    aiAnalysisStatus: "COMPLETED",
    aiExtractedSkills: [
      { skill: "React", experience: 4, importance: "HIGH" },
      { skill: "TypeScript", experience: 3, importance: "HIGH" },
      { skill: "Next.js", experience: 3, importance: "MEDIUM" },
      { skill: "Tailwind CSS", experience: 2, importance: "MEDIUM" }
    ],
    aiExtractedExperience: [
      { title: "Frontend Developer", company: "BavariaTech", duration: "2.5 years", startDate: "2022-01", endDate: "present" },
      { title: "Web Developer", company: "MunichStartup", duration: "1.5 years", startDate: "2020-06", endDate: "2022-01" }
    ],
    aiExtractedEducation: [
      { degree: "Bachelor of Science", field: "Information Technology", institution: "Technical University of Munich", year: "2020" }
    ],
    aiTags: ["react", "typescript", "nextjs", "tailwind", "frontend", "modern"],
    aiSummary: "Frontend developer with expertise in modern React stack including Next.js and Tailwind CSS. Strong focus on user experience and performance.",
    overallRankingScore: 88.9
  }
];

async function main() {
  console.log("🌱 Seeding database with demo candidates...");

  // Clear existing data
  await prisma.jobCandidateMatch.deleteMany();
  await prisma.candidate.deleteMany();

  // Create candidates
  for (const candidateData of demoCandidates) {
    await prisma.candidate.create({
      data: {
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        location: candidateData.location,
        linkedinUrl: candidateData.linkedinUrl,
        cvSource: candidateData.cvSource as any,
        aiAnalysisStatus: candidateData.aiAnalysisStatus as any,
        aiExtractedSkills: candidateData.aiExtractedSkills,
        aiExtractedExperience: candidateData.aiExtractedExperience,
        aiExtractedEducation: candidateData.aiExtractedEducation,
        aiTags: candidateData.aiTags,
        aiSummary: candidateData.aiSummary,
        overallRankingScore: candidateData.overallRankingScore,
        cvUploadTimestamp: new Date(),
        aiLastProcessedAt: new Date()
      }
    });
  }

  console.log(`✅ Created ${demoCandidates.length} demo candidates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
