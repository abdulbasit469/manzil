/**
 * Seed data for DegreeScope collection (Option A).
 * Pakistan job market context – entry/mid salary in PKR, local roles.
 */
const degreeScopeSeed = [
  {
    degreeName: 'MBBS',
    field: 'Medical',
    scope: 'MBBS is the primary medical degree in Pakistan, leading to practice as a doctor. Graduates can work in public and private hospitals, clinics, research, or pursue specializations (FCPS, MRCP, etc.). The degree is recognized by PM&DC and is essential for medical practice.',
    jobRoles: ['Medical Officer', 'House Officer', 'Resident Doctor', 'General Physician', 'Specialist (after FCPS/MD)', 'Medical Researcher', 'Public Health Officer'],
    salaryEntry: '80,000 – 150,000 PKR/month',
    salaryMid: '250,000 – 600,000+ PKR/month (with experience/specialization)',
    trends: 'Steady demand in Pakistan; shortage in rural areas. Telemedicine and digital health are growing. Specializations in cardiology, radiology, and surgery remain high-value.',
    order: 1
  },
  {
    degreeName: 'Pharm-D',
    field: 'Medical',
    scope: 'Pharm-D is a professional pharmacy degree. Graduates work in hospitals, retail and clinical pharmacy, pharmaceutical industry, regulatory bodies, and research. Role includes dispensing medicines, drug information, and patient counseling.',
    jobRoles: ['Clinical Pharmacist', 'Hospital Pharmacist', 'Retail Pharmacist', 'Pharmaceutical Analyst', 'Regulatory Affairs Officer', 'Drug Safety Associate'],
    salaryEntry: '40,000 – 70,000 PKR/month',
    salaryMid: '100,000 – 200,000 PKR/month',
    trends: 'Growing demand in hospitals and industry. Regulatory and quality assurance roles are expanding. Opportunities in pharmaceutical manufacturing and export.',
    order: 2
  },
  {
    degreeName: 'BS Computer Science',
    field: 'Computer Science',
    scope: 'BS Computer Science covers programming, algorithms, databases, software engineering, and systems. Graduates work in software development, IT services, startups, banks, and tech companies in Pakistan and remotely for global firms.',
    jobRoles: ['Software Engineer', 'Web Developer', 'Mobile App Developer', 'Data Analyst', 'Systems Analyst', 'DevOps Engineer', 'QA Engineer'],
    salaryEntry: '50,000 – 100,000 PKR/month',
    salaryMid: '150,000 – 400,000+ PKR/month',
    trends: 'Very high demand locally and for remote work. AI/ML, cloud, and fintech are growing. Strong scope in freelancing and product companies.',
    order: 3
  },
  {
    degreeName: 'BS Software Engineering',
    field: 'Computer Science',
    scope: 'Software Engineering focuses on building and maintaining software systems, SDLC, and project management. Graduates join product companies, software houses, and IT departments across industries.',
    jobRoles: ['Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Project Coordinator', 'Technical Lead', 'Product Manager'],
    salaryEntry: '55,000 – 110,000 PKR/month',
    salaryMid: '160,000 – 450,000+ PKR/month',
    trends: 'Demand matches CS; agile and cloud skills are valued. Remote and hybrid roles are common.',
    order: 4
  },
  {
    degreeName: 'BS Electrical Engineering',
    field: 'Engineering',
    scope: 'Electrical Engineering covers power systems, electronics, and communications. Graduates work in WAPDA, DISCOs, telecom, manufacturing, and construction. PEC registration is required for engineering practice.',
    jobRoles: ['Electrical Engineer', 'Power Systems Engineer', 'Electronics Engineer', 'Project Engineer', 'Design Engineer', 'Maintenance Engineer'],
    salaryEntry: '45,000 – 85,000 PKR/month',
    salaryMid: '120,000 – 300,000 PKR/month',
    trends: 'Stable demand in power and telecom. Solar and renewable energy sectors are growing. CPEC and infrastructure projects create opportunities.',
    order: 5
  },
  {
    degreeName: 'BS Mechanical Engineering',
    field: 'Engineering',
    scope: 'Mechanical Engineering deals with design, manufacturing, and maintenance of machinery and systems. Graduates work in automotive, HVAC, manufacturing, oil & gas, and construction. PEC registration applies.',
    jobRoles: ['Mechanical Engineer', 'Design Engineer', 'Production Engineer', 'Maintenance Engineer', 'Quality Engineer', 'Project Engineer'],
    salaryEntry: '40,000 – 75,000 PKR/month',
    salaryMid: '100,000 – 280,000 PKR/month',
    trends: 'Manufacturing and automotive sectors drive demand. Automation and HVAC remain strong. Export-oriented industries offer growth.',
    order: 6
  },
  {
    degreeName: 'BBA',
    field: 'Business',
    scope: 'BBA introduces management, marketing, finance, and HR. Graduates join corporates, banks, FMCG, and startups in roles from trainee to analyst. Foundation for MBA and other business careers.',
    jobRoles: ['Business Analyst', 'Marketing Executive', 'HR Coordinator', 'Sales Executive', 'Operations Trainee', 'Banking Officer'],
    salaryEntry: '35,000 – 65,000 PKR/month',
    salaryMid: '90,000 – 250,000 PKR/month',
    trends: 'Consistent demand across sectors. Digital marketing and analytics skills are valued. MBA further boosts earning potential.',
    order: 7
  },
  {
    degreeName: 'MBA',
    field: 'Business',
    scope: 'MBA builds on graduation for leadership and strategy. Graduates move into management, consulting, and senior roles in corporate, banking, and startups. Specializations include finance, marketing, and operations.',
    jobRoles: ['Manager', 'Consultant', 'Business Development Manager', 'Product Manager', 'Strategy Analyst', 'Branch Manager'],
    salaryEntry: '80,000 – 150,000 PKR/month',
    salaryMid: '200,000 – 500,000+ PKR/month',
    trends: 'Top schools (IBA, LUMS, etc.) have strong placement. Executive MBA and specialized MBAs are in demand.',
    order: 8
  },
  {
    degreeName: 'BS Psychology',
    field: 'Arts',
    scope: 'Psychology covers human behavior, mental health, and assessment. Graduates work in clinics, schools, HR, NGOs, and research. Further training (MPhil/clinical) opens therapy and counseling practice.',
    jobRoles: ['Counselor', 'HR Specialist', 'School Psychologist', 'Research Assistant', 'Mental Health Worker', 'Behavioral Analyst'],
    salaryEntry: '30,000 – 55,000 PKR/month',
    salaryMid: '70,000 – 180,000 PKR/month',
    trends: 'Awareness of mental health is increasing. Demand in corporate HR and education. Clinical and organizational psychology are growing.',
    order: 9
  },
  {
    degreeName: 'BS Mass Communication',
    field: 'Arts',
    scope: 'Mass Communication covers media, journalism, and content. Graduates work in TV, radio, digital media, PR, advertising, and corporate communications.',
    jobRoles: ['Journalist', 'Content Writer', 'Social Media Manager', 'PR Officer', 'Video Producer', 'Editor'],
    salaryEntry: '28,000 – 50,000 PKR/month',
    salaryMid: '60,000 – 150,000 PKR/month',
    trends: 'Digital and social media have expanded roles. Freelancing and content creation are common. News and entertainment sectors remain key employers.',
    order: 10
  },
  {
    degreeName: 'B.Ed',
    field: 'Other',
    scope: 'B.Ed prepares graduates for teaching in schools. It covers pedagogy, curriculum, and assessment. Required for many teaching positions in public and private schools.',
    jobRoles: ['School Teacher', 'Subject Specialist', 'Curriculum Coordinator', 'Education Officer', 'Tutor', 'Training Facilitator'],
    salaryEntry: '25,000 – 45,000 PKR/month',
    salaryMid: '50,000 – 120,000 PKR/month',
    trends: 'Demand is steady in schools and education projects. Private chains and EdTech offer additional opportunities.',
    order: 11
  },
  {
    degreeName: 'BS Data Science',
    field: 'Computer Science',
    scope: 'Data Science combines statistics, programming, and domain knowledge to analyze data and build models. Graduates work in tech, finance, e-commerce, and research.',
    jobRoles: ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Intelligence Analyst', 'Data Engineer'],
    salaryEntry: '60,000 – 120,000 PKR/month',
    salaryMid: '180,000 – 450,000+ PKR/month',
    trends: 'High demand; AI/ML and big data skills are sought. Remote and product companies hire actively.',
    order: 12
  },
  {
    degreeName: 'BS Nursing',
    field: 'Medical',
    scope: 'BS Nursing prepares for clinical and community nursing. Graduates work in hospitals, clinics, and public health. Registration with Pakistan Nursing Council is required.',
    jobRoles: ['Staff Nurse', 'Clinical Nurse', 'ICU Nurse', 'Community Health Nurse', 'Nursing Supervisor', 'Health Educator'],
    salaryEntry: '35,000 – 60,000 PKR/month',
    salaryMid: '70,000 – 150,000 PKR/month',
    trends: 'Demand is high in hospitals and overseas. Specializations and abroad opportunities are common.',
    order: 13
  },
  {
    degreeName: 'BS Accounting & Finance',
    field: 'Business',
    scope: 'Combines accounting, auditing, and finance. Graduates work in audit firms, banks, corporate finance, and tax. CA, ACCA, or CFA further boost career.',
    jobRoles: ['Accountant', 'Audit Associate', 'Financial Analyst', 'Tax Consultant', 'Treasury Officer', 'Credit Analyst'],
    salaryEntry: '40,000 – 70,000 PKR/month',
    salaryMid: '100,000 – 300,000 PKR/month',
    trends: 'Stable demand in accounting and finance. Big four and banks are major employers. Professional certifications add value.',
    order: 14
  },
  {
    degreeName: 'BS Civil Engineering',
    field: 'Engineering',
    scope: 'Civil Engineering covers structures, construction, and infrastructure. Graduates work in construction firms, NHA, WAPDA, and consultancies. PEC registration required.',
    jobRoles: ['Site Engineer', 'Structural Engineer', 'Design Engineer', 'Project Engineer', 'Quantity Surveyor', 'Highway Engineer'],
    salaryEntry: '42,000 – 80,000 PKR/month',
    salaryMid: '110,000 – 320,000 PKR/month',
    trends: 'Infrastructure and CPEC projects drive demand. Construction and real estate remain strong.',
    order: 15
  },
  {
    degreeName: 'BS Sociology',
    field: 'Social Sciences',
    scope: 'Sociology studies society, institutions, and behavior. Graduates work in NGOs, research, development projects, and public policy.',
    jobRoles: ['Research Officer', 'Project Coordinator', 'Community Mobilizer', 'Policy Analyst', 'Social Researcher', 'Development Officer'],
    salaryEntry: '28,000 – 50,000 PKR/month',
    salaryMid: '55,000 – 130,000 PKR/month',
    trends: 'NGO and development sector demand is steady. Research and policy roles are growing.',
    order: 16
  },
  {
    degreeName: 'BS Economics',
    field: 'Business',
    scope: 'Economics covers micro/macro economics, policy, and quantitative methods. Graduates join banks, SBP, research, and corporate planning.',
    jobRoles: ['Economic Analyst', 'Research Associate', 'Policy Analyst', 'Banking Officer', 'Data Analyst', 'Consultant'],
    salaryEntry: '38,000 – 65,000 PKR/month',
    salaryMid: '90,000 – 250,000 PKR/month',
    trends: 'Central bank, think tanks, and banks hire. Data and policy analysis skills are valued.',
    order: 17
  }
];

module.exports = degreeScopeSeed;
