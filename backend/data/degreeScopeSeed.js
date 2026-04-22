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
  },
  {
    degreeName: 'BDS',
    field: 'Medical',
    scope: 'BDS prepares students for dental practice, oral surgery support, and preventive oral healthcare in clinics and hospitals.',
    jobRoles: ['Dental Surgeon', 'Dental Officer', 'Orthodontics Resident', 'Oral Health Educator', 'Dental Clinic Manager'],
    salaryEntry: '70,000 – 130,000 PKR/month',
    salaryMid: '180,000 – 420,000 PKR/month',
    trends: 'Private dentistry and cosmetic procedures are growing, especially in major cities.',
    order: 18
  },
  {
    degreeName: 'DPT',
    field: 'Medical',
    scope: 'Doctor of Physical Therapy focuses on rehabilitation, movement science, and sports injury management.',
    jobRoles: ['Physiotherapist', 'Rehab Therapist', 'Sports Therapist', 'Clinical Instructor', 'Ergonomics Consultant'],
    salaryEntry: '40,000 – 75,000 PKR/month',
    salaryMid: '100,000 – 220,000 PKR/month',
    trends: 'Demand is increasing in hospitals, sports medicine, and private rehabilitation centers.',
    order: 19
  },
  {
    degreeName: 'BS Medical Lab Technology (MLT)',
    field: 'Medical',
    scope: 'MLT trains students in diagnostic lab methods for pathology, hematology, microbiology, and biochemistry.',
    jobRoles: ['Medical Lab Technologist', 'Lab Supervisor', 'Pathology Assistant', 'Diagnostic Analyst'],
    salaryEntry: '35,000 – 65,000 PKR/month',
    salaryMid: '85,000 – 180,000 PKR/month',
    trends: 'Diagnostics demand is strong with expansion of labs and hospital networks.',
    order: 20
  },
  {
    degreeName: 'BS Radiology / Imaging Technology',
    field: 'Medical',
    scope: 'Focuses on X-ray, CT, MRI, and imaging workflows in hospitals and diagnostic centers.',
    jobRoles: ['Radiology Technologist', 'Imaging Technician', 'MRI/CT Operator', 'Radiology Assistant'],
    salaryEntry: '40,000 – 70,000 PKR/month',
    salaryMid: '90,000 – 210,000 PKR/month',
    trends: 'Healthcare imaging services are expanding in both public and private sectors.',
    order: 21
  },
  {
    degreeName: 'BS Optometry',
    field: 'Medical',
    scope: 'Optometry covers eye assessment, vision correction, and primary eye-care support.',
    jobRoles: ['Optometrist', 'Vision Therapist', 'Eye Clinic Associate', 'Contact Lens Specialist'],
    salaryEntry: '35,000 – 60,000 PKR/month',
    salaryMid: '80,000 – 180,000 PKR/month',
    trends: 'Demand is rising due to increased eye-care awareness and screen-related vision issues.',
    order: 22
  },
  {
    degreeName: 'BS Public Health',
    field: 'Medical',
    scope: 'Public Health trains students in epidemiology, health policy, and community health planning.',
    jobRoles: ['Public Health Officer', 'Program Coordinator', 'Epidemiology Assistant', 'Health Policy Analyst'],
    salaryEntry: '40,000 – 75,000 PKR/month',
    salaryMid: '100,000 – 230,000 PKR/month',
    trends: 'NGO and government projects continue to create opportunities in health management.',
    order: 23
  },
  {
    degreeName: 'BS Nutrition & Dietetics',
    field: 'Medical',
    scope: 'Covers clinical nutrition, diet planning, and lifestyle-based preventive health.',
    jobRoles: ['Clinical Dietitian', 'Nutritionist', 'Wellness Consultant', 'Community Nutrition Officer'],
    salaryEntry: '35,000 – 65,000 PKR/month',
    salaryMid: '85,000 – 200,000 PKR/month',
    trends: 'Wellness and metabolic health services are growing in hospitals and private practice.',
    order: 24
  },
  {
    degreeName: 'BS Information Technology (IT)',
    field: 'Computer Science',
    scope: 'IT focuses on networks, systems, databases, and enterprise technology support.',
    jobRoles: ['IT Support Engineer', 'System Administrator', 'Network Engineer', 'Cloud Support Associate'],
    salaryEntry: '45,000 – 90,000 PKR/month',
    salaryMid: '130,000 – 320,000 PKR/month',
    trends: 'Cloud adoption and cybersecurity needs keep IT roles in high demand.',
    order: 25
  },
  {
    degreeName: 'BS Artificial Intelligence (AI)',
    field: 'Computer Science',
    scope: 'AI degree covers machine learning, neural networks, NLP, and intelligent automation systems.',
    jobRoles: ['AI Engineer', 'ML Engineer', 'NLP Engineer', 'Computer Vision Engineer'],
    salaryEntry: '70,000 – 140,000 PKR/month',
    salaryMid: '200,000 – 500,000+ PKR/month',
    trends: 'AI adoption is rapidly increasing across fintech, healthtech, and product startups.',
    order: 26
  },
  {
    degreeName: 'BS Cyber Security',
    field: 'Computer Science',
    scope: 'Cyber Security focuses on securing systems, networks, and applications against attacks.',
    jobRoles: ['Security Analyst', 'SOC Engineer', 'Penetration Tester', 'Information Security Officer'],
    salaryEntry: '65,000 – 130,000 PKR/month',
    salaryMid: '180,000 – 420,000 PKR/month',
    trends: 'Cybersecurity spending and hiring are rising across banking, telecom, and government.',
    order: 27
  },
  {
    degreeName: 'BS Computer Engineering',
    field: 'Engineering',
    scope: 'Computer Engineering combines software, hardware, and embedded systems design.',
    jobRoles: ['Embedded Systems Engineer', 'Hardware Design Engineer', 'Firmware Engineer', 'IoT Engineer'],
    salaryEntry: '55,000 – 100,000 PKR/month',
    salaryMid: '150,000 – 360,000 PKR/month',
    trends: 'Embedded and IoT roles are increasing in automation, electronics, and robotics.',
    order: 28
  },
  {
    degreeName: 'BS Game Development',
    field: 'Computer Science',
    scope: 'Game Development includes game engines, graphics, interactive design, and gameplay programming.',
    jobRoles: ['Game Developer', 'Gameplay Programmer', 'Technical Artist', 'Level Designer'],
    salaryEntry: '45,000 – 85,000 PKR/month',
    salaryMid: '120,000 – 300,000 PKR/month',
    trends: 'Mobile gaming and outsourcing studios are growing in Pakistan.',
    order: 29
  },
  {
    degreeName: 'BS Robotics & Intelligent Systems',
    field: 'Engineering',
    scope: 'Combines mechanics, electronics, control systems, and AI for automation and intelligent machines.',
    jobRoles: ['Robotics Engineer', 'Automation Engineer', 'Control Systems Engineer', 'Mechatronics Specialist'],
    salaryEntry: '60,000 – 110,000 PKR/month',
    salaryMid: '160,000 – 380,000 PKR/month',
    trends: 'Industrial automation and smart manufacturing are creating new roles.',
    order: 30
  },
  {
    degreeName: 'BS Chemical Engineering',
    field: 'Engineering',
    scope: 'Covers chemical processes, plant design, and production systems for process industries.',
    jobRoles: ['Process Engineer', 'Production Engineer', 'Plant Engineer', 'Quality Engineer'],
    salaryEntry: '45,000 – 85,000 PKR/month',
    salaryMid: '120,000 – 300,000 PKR/month',
    trends: 'Demand remains steady in fertilizer, pharma, and energy sectors.',
    order: 31
  },
  {
    degreeName: 'BS Mechatronics Engineering',
    field: 'Engineering',
    scope: 'Mechatronics integrates mechanical systems, electronics, and software control.',
    jobRoles: ['Mechatronics Engineer', 'Automation Engineer', 'Robotics Integrator', 'Control Engineer'],
    salaryEntry: '50,000 – 95,000 PKR/month',
    salaryMid: '140,000 – 330,000 PKR/month',
    trends: 'Factories and smart systems are driving demand for mechatronics skills.',
    order: 32
  },
  {
    degreeName: 'BS Aerospace Engineering',
    field: 'Engineering',
    scope: 'Focuses on aircraft and spacecraft structures, propulsion, and aerodynamics.',
    jobRoles: ['Aerospace Engineer', 'Design Engineer', 'Flight Systems Analyst', 'Maintenance Engineer'],
    salaryEntry: '55,000 – 100,000 PKR/month',
    salaryMid: '150,000 – 360,000 PKR/month',
    trends: 'Niche but growing opportunities in defense, aviation, and R&D.',
    order: 33
  },
  {
    degreeName: 'BS Industrial Engineering',
    field: 'Engineering',
    scope: 'Industrial Engineering optimizes operations, supply chains, and productivity systems.',
    jobRoles: ['Industrial Engineer', 'Process Improvement Analyst', 'Operations Engineer', 'Supply Chain Analyst'],
    salaryEntry: '45,000 – 85,000 PKR/month',
    salaryMid: '120,000 – 280,000 PKR/month',
    trends: 'Manufacturing and logistics modernization are increasing demand.',
    order: 34
  },
  {
    degreeName: 'BS Petroleum Engineering',
    field: 'Engineering',
    scope: 'Covers oil and gas exploration, drilling, and reservoir engineering.',
    jobRoles: ['Petroleum Engineer', 'Drilling Engineer', 'Reservoir Engineer', 'Production Engineer'],
    salaryEntry: '60,000 – 120,000 PKR/month',
    salaryMid: '180,000 – 450,000 PKR/month',
    trends: 'Demand depends on energy investments; specialized field with strong upside.',
    order: 35
  },
  {
    degreeName: 'BS Biomedical Engineering',
    field: 'Engineering',
    scope: 'Combines engineering with medical device design, diagnostics, and healthcare technology.',
    jobRoles: ['Biomedical Engineer', 'Medical Device Engineer', 'Clinical Engineer', 'Equipment Specialist'],
    salaryEntry: '50,000 – 95,000 PKR/month',
    salaryMid: '140,000 – 320,000 PKR/month',
    trends: 'Medical device and health-tech demand is rising.',
    order: 36
  },
  {
    degreeName: 'BS Environmental Engineering',
    field: 'Engineering',
    scope: 'Focuses on water treatment, pollution control, and sustainable engineering systems.',
    jobRoles: ['Environmental Engineer', 'Water Treatment Engineer', 'EHS Specialist', 'Sustainability Analyst'],
    salaryEntry: '45,000 – 80,000 PKR/month',
    salaryMid: '120,000 – 280,000 PKR/month',
    trends: 'Compliance and sustainability requirements are expanding this field.',
    order: 37
  }
];

module.exports = degreeScopeSeed;
