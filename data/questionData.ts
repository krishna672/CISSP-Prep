
import { Question } from '../types';

export const questions: Question[] = [
  // --- DOMAIN 1: Security & Risk Management ---
  {
    id: "D1-Q01", domain: "CIA Triad & Foundations", subdomain: "Confidentiality", difficulty: "Moderate",
    stem: "A security professional is hiding a sensitive message within the least significant bits of a JPEG file. Which concept from the mind map is being utilized?",
    options: { "A": "Traffic Padding", "B": "Symmetric Encryption", "C": "Steganography", "D": "Message Authentication Code" },
    correctOption: "C",
    explanation: "Steganography is the art of hiding data within another data carrier, such as an image file (JPEG), as noted in the Confidentiality section of the mind map.",
    primaryConcepts: ["Steganography", "Confidentiality"], references: []
  },
  {
    id: "D1-Q02", domain: "CIA Triad & Foundations", subdomain: "Integrity", difficulty: "Hard",
    stem: "Which of the following describes a 'Salami Attack' as categorized in the mind map?",
    options: { "A": "A massive DDoS attack using botnets", "B": "Shredding small amounts of money from many accounts to a hidden one", "C": "Modifying file timestamps to bypass auditing", "D": "Capturing hashes to perform a pass-the-hash attack" },
    correctOption: "B",
    explanation: "A Salami attack involves committing small, nearly unnoticeable crimes (like skimming cents from transactions) that add up to a significant amount over time.",
    primaryConcepts: ["Salami Attack", "Integrity"], references: []
  },
  {
    id: "D1-Q03", domain: "Security Governance", subdomain: "Personnel Security", difficulty: "Moderate",
    stem: "Which personnel security control is specifically designed as a 'detective' mechanism to uncover internal fraud or malfeasance?",
    options: { "A": "Separation of Duties", "B": "Mandatory Vacation", "C": "Least Privilege", "D": "Non-Disclosure Agreement" },
    correctOption: "B",
    explanation: "Mandatory Vacation of 1-2 weeks allows other employees to step in and potentially discover fraudulent activities that the primary employee was hiding.",
    primaryConcepts: ["Mandatory Vacation", "Detective Controls"], references: []
  },
  {
    id: "D1-Q04", domain: "Security Governance", subdomain: "Roles", difficulty: "Hard",
    stem: "Who is ultimately liable for the protection of data within an organization according to CISSP governance principles?",
    options: { "A": "The Data Custodian", "B": "The System Administrator", "C": "The Data Owner", "D": "The Data Subject" },
    correctOption: "C",
    explanation: "The Data Owner (Information Owner) is typically a business manager who has ultimate responsibility and liability for the data.",
    primaryConcepts: ["Data Owner", "Liability"], references: []
  },
  {
    id: "D1-Q05", domain: "Business Continuity & BIA", subdomain: "BIA Metrics", difficulty: "Hard",
    stem: "In disaster recovery planning, if the RTO is 4 hours and the WRT is 2 hours, what is the minimum value the MTD must be to avoid business failure?",
    options: { "A": "2 hours", "B": "4 hours", "C": "6 hours", "D": "8 hours" },
    correctOption: "C",
    explanation: "The formula from the mind map is MTD >= RTO + WRT. Therefore, 4 + 2 = 6 hours.",
    primaryConcepts: ["MTD", "RTO", "WRT"], references: []
  },
  {
    id: "D1-Q06", domain: "Business Continuity & BIA", subdomain: "External Dependencies", difficulty: "Moderate",
    stem: "What does the 'Right-to-Audit' clause in an SLA primarily provide to an organization?",
    options: { "A": "Automatic insurance coverage", "B": "The ability to verify a vendor's security posture and compliance", "C": "A guarantee of 100% uptime", "D": "Legal ownership of the vendor's infrastructure" },
    correctOption: "B",
    explanation: "A 'Right-to-Audit' clause is a critical enforcement mechanism that allows the customer to verify that the vendor is actually meeting the security standards claimed in the contract.",
    primaryConcepts: ["SLA", "Right-to-Audit"], references: []
  },
  {
    id: "D1-Q07", domain: "Professional Ethics", subdomain: "ISC2 Canons", difficulty: "Moderate",
    stem: "A CISSP is faced with a choice between protecting a client's private interest and protecting a public power grid's infrastructure. According to the ISC2 Code of Ethics canons, which takes priority?",
    options: { "A": "The client's interest (Canon 3)", "B": "The public infrastructure (Canon 1)", "C": "The profession's reputation (Canon 4)", "D": "Legal compliance (Canon 2)" },
    correctOption: "B",
    explanation: "Canon 1: 'Protect society, the common good, necessary public trust and confidence, and the infrastructure' takes precedence over all other canons.",
    primaryConcepts: ["ISC2 Canons", "Ethics Priority"], references: []
  },
  {
    id: "D1-Q08", domain: "Risk Management", subdomain: "Calculations", difficulty: "Hard",
    stem: "A server is worth $5,000. An earthquake is expected once every 10 years and would result in 50% damage to the server. What is the Annualized Loss Expectancy (ALE)?",
    options: { "A": "$250", "B": "$500", "C": "$2,500", "D": "$5,000" },
    correctOption: "A",
    explanation: "SLE = $5,000 x 0.50 = $2,500. ARO = 1/10 = 0.1. ALE = SLE x ARO = $2,500 x 0.1 = $250.",
    primaryConcepts: ["ALE", "SLE", "ARO"], references: []
  },
  {
    id: "D1-Q09", domain: "Risk Management", subdomain: "Risk Response", difficulty: "Basic",
    stem: "Ignoring a known risk without conducting any analysis or management sign-off is known as:",
    options: { "A": "Risk Acceptance", "B": "Risk Mitigation", "C": "Risk Rejection", "D": "Risk Transference" },
    correctOption: "C",
    explanation: "Risk Rejection is the act of ignoring a risk, which is considered gross negligence and never acceptable for a professional.",
    primaryConcepts: ["Risk Rejection", "Negligence"], references: []
  },
  {
    id: "D1-Q10", domain: "Legal, Regulatory & Compliance", subdomain: "Intellectual Property", difficulty: "Moderate",
    stem: "Which form of IP protection is valid for 20 years and requires the invention to be Novel, Useful, and Non-obvious?",
    options: { "A": "Copyright", "B": "Patent", "C": "Trademark", "D": "Trade Secret" },
    correctOption: "B",
    explanation: "As per the mind map, Patents last 20 years and require the invention to meet the 'Novel, Useful, and Non-obvious' criteria.",
    primaryConcepts: ["Patents", "IP Law"], references: []
  },
  {
    id: "D1-Q11", domain: "Legal, Regulatory & Compliance", subdomain: "Privacy", difficulty: "Hard",
    stem: "Under GDPR, how much time does an organization have to notify the supervisory authority of a data breach?",
    options: { "A": "24 hours", "B": "48 hours", "C": "72 hours", "D": "7 days" },
    correctOption: "C",
    explanation: "GDPR mandates that organizations must notify the supervisory authority of a data breach within 72 hours of becoming aware of it.",
    primaryConcepts: ["GDPR", "Breach Notification"], references: []
  },
  {
    id: "D1-Q12", domain: "Threats & Attackers", subdomain: "Profiles", difficulty: "Moderate",
    stem: "What does the 'Persistent' in APT (Advanced Persistent Threat) primarily refer to?",
    options: { "A": "The use of constant automated scanning", "B": "The attacker's long-term motivation and repeated attempts to gain access", "C": "The malware's ability to survive a reboot", "D": "The high volume of traffic generated during the attack" },
    correctOption: "B",
    explanation: "Persistence in APT refers to the attacker's commitment to the target. If they are blocked, they will try new methods and wait for new vulnerabilities over long periods.",
    primaryConcepts: ["APT", "Threat Actors"], references: []
  },

  // --- DOMAIN 2: Asset Security ---
  {
    id: "D2-Q01", domain: "Domain 2: Asset Security", subdomain: "Memory & Remanence", difficulty: "Hard",
    stem: "A systems administrator needs to securely dispose of a high-capacity SSD that contained extremely sensitive R&D data. Which of the following is the MOST effective method according to Domain 2 standards?",
    options: { "A": "Degaussing the drive multiple times", "B": "Performing a standard high-level format", "C": "Physical destruction or ATA Secure Erase", "D": "Deleting the partitions and overwriting with 0s" },
    correctOption: "C",
    explanation: "As noted in the Domain 2 mind map, SSDs cannot be degaussed because they are not magnetic. Physical destruction or ATA Secure Erase are the required methods for secure disposal.",
    primaryConcepts: ["SSD Destruction", "Secure Erase"], references: []
  },
  {
    id: "D2-Q02", domain: "Domain 2: Asset Security", subdomain: "Asset Classification", difficulty: "Moderate",
    stem: "In a government organization, what level of classification is assigned to data that, if disclosed, would cause 'Serious Damage' but not 'Exceptionally Grave Damage'?",
    options: { "A": "Top Secret", "B": "Secret", "C": "Confidential", "D": "Unclassified" },
    correctOption: "B",
    explanation: "In the US Government classification scheme, Secret is assigned to data causing 'Serious Damage'. Top Secret causes 'Exceptionally Grave Damage' and Confidential causes 'Damage'.",
    primaryConcepts: ["Classification Levels", "Government Standards"], references: []
  },
  {
    id: "D2-Q03", domain: "Domain 2: Asset Security", subdomain: "Roles & Responsibilities", difficulty: "Hard",
    stem: "Who is responsible for accepting the residual risk of a system and granting the formal approval to put it into production?",
    options: { "A": "Security Administrator", "B": "Data Custodian", "C": "Authorizing Official (Accreditor)", "D": "Data Owner" },
    correctOption: "C",
    explanation: "Accreditation is the formal acceptance of residual risk by a management official (Authorizing Official). The Data Owner usually accepts it, but in many frameworks, this specific final step is the Accreditor.",
    primaryConcepts: ["Accreditation", "Residual Risk"], references: []
  },

  // --- DOMAIN 3: Security Architecture and Engineering ---
  {
    id: "D3-Q01", domain: "Domain 3: Security Architecture and Engineering", subdomain: "Security Models", difficulty: "Hard",
    stem: "An organization is implementing a system where a subject's permission to access an object changes dynamically based on whether they have previously accessed data from a competitor. Which model is being described?",
    options: { "A": "Bell-LaPadula", "B": "Biba Integrity", "C": "Brewer-Nash", "D": "Clark-Wilson" },
    correctOption: "C",
    explanation: "Brewer-Nash (Chinese Wall) is specifically designed to prevent Conflict of Interest by monitoring access history and blocking access to competing conflict classes.",
    primaryConcepts: ["Brewer-Nash", "Conflict of Interest"], references: []
  },
  {
    id: "D3-Q02", domain: "Domain 3: Security Architecture and Engineering", subdomain: "Evaluation", difficulty: "Moderate",
    stem: "A security manager is reviewing firewall specifications and sees a requirement for EAL 4. According to Common Criteria (ISO 15408), what does EAL 4 signify?",
    options: { "A": "Functionally Tested", "B": "Methodically Designed, Tested and Reviewed", "C": "Semi-formally Verified Design and Tested", "D": "Formally Verified Design and Tested" },
    correctOption: "B",
    explanation: "EAL 4 is 'Methodically Designed, Tested and Reviewed'. It is the standard commercially available assurance level for major security products like firewalls.",
    primaryConcepts: ["Common Criteria", "EAL Levels"], references: []
  },
  {
    id: "D3-Q03", domain: "Domain 3: Security Architecture and Engineering", subdomain: "Physical Security", difficulty: "Moderate",
    stem: "During a data center inspection, a fire marshal notes that the sprinkler system is a 'Dry Pipe' system. Why would a data center architect choose this over a standard 'Wet Pipe' system?",
    options: { "A": "It is cheaper to maintain and install", "B": "It provides faster response times to Class A fires", "C": "It reduces the risk of accidental water damage from pipe leaks", "D": "It is required for Class C electrical fires by law" },
    correctOption: "C",
    explanation: "Dry pipe systems hold compressed air instead of water in the pipes until a valve is opened by a separate fire trigger. This prevents water from damaging expensive server hardware if a pipe or head develops a minor leak.",
    primaryConcepts: ["Dry Pipe", "Physical Security", "Fire Suppression"], references: []
  },
  {
    id: "D3-Q04", domain: "Domain 3: Security Architecture and Engineering", subdomain: "Security Models", difficulty: "Hard",
    stem: "A developer is building a high-integrity medical records database. They want to ensure that users can only modify records through a specific set of programs to maintain consistency. Which model should they prioritize?",
    options: { "A": "Bell-LaPadula", "B": "Clark-Wilson", "C": "Biba", "D": "Non-Interference" },
    correctOption: "B",
    explanation: "Clark-Wilson focuses on integrity through well-formed transactions (Transformation Procedures) and separation of duties, ensuring data is only modified via authorized programs.",
    primaryConcepts: ["Clark-Wilson", "Integrity"], references: []
  }
];
