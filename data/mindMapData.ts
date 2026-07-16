
import { MindMapNode } from '../types';

export const MM_COLORS = {
  ROOT: '#0f172a',
  DOMAIN1: '#2563eb', // Blue
  DOMAIN2: '#0891b2', // Cyan
  DOMAIN3: '#4f46e5', // Indigo
  DOMAIN4: '#f59e0b', // Amber
  DOMAIN5: '#10b981', // Emerald
  DOMAIN6: '#ef4444', // Red
  DOMAIN7: '#8b5cf6', // Violet
  DOMAIN8: '#ec4899', // Pink
};

export const mindMapData: MindMapNode = {
  id: "CISSP-ROOT",
  label: "CISSP Body of Knowledge",
  type: "root",
  color: MM_COLORS.ROOT,
  definition: "Complete knowledge base reconstructed from ThorTeaches Study Guides and CISSP Exam Objectives.",
  children: [
    { 
      id: "D1", 
      label: "Domain 1: Security and Risk Management", 
      type: "domain", 
      color: MM_COLORS.DOMAIN1,
      definition: "The most weighted domain on the exam (approx. 15%). It sets the stage for the entire CISSP CBK by defining how security is governed, how risk is managed, and the legal/ethical requirements of the profession.",
      keyAspect: "Management Thinking: Security must be a business enabler, not a hurdle. Strategic alignment with organizational goals is the primary driver.",
      children: [
        {
          id: "D1-CORE", label: "Core Security Concepts", type: "subdomain",
          definition: "The fundamental building blocks of all security architectures.",
          children: [
            { 
              id: "D1-CIA", label: "CIA Triad", type: "concept",
              definition: "The goal of every security program: Confidentiality, Integrity, and Availability.",
              children: [
                { 
                  id: "D1-C", label: "Confidentiality", type: "detail", 
                  definition: "The property that information is not made available or disclosed to unauthorized individuals, entities, or processes. It involves protecting sensitive data from being accessed or read by unauthorized parties.",
                  example: "Exam Scenario: A company discovers a disgruntled employee has been 'sniffing' network traffic to find clear-text passwords. This is a direct violation of Confidentiality.",
                  enforcement: "Controls: \n1. Encryption (At rest and in transit)\n2. Access Control Lists (ACLs)\n3. Steganography\n4. Data masking/obfuscation\n5. Strong authentication and authorization protocols.",
                  keyAspect: "Exam Focus: If a question mentions 'unauthorized disclosure' or 'privacy', the answer is likely Confidentiality."
                },
                { 
                  id: "D1-I", label: "Integrity", type: "detail", 
                  definition: "The property of accuracy and completeness. It involves protecting information from being modified by unauthorized parties or through unauthorized processes, ensuring that the data remains trustworthy throughout its lifecycle.",
                  example: "Exam Scenario: An attacker modifies the recipient's bank account number in a wire transfer request. The data reached the destination, but the information was altered.",
                  enforcement: "Controls: \n1. Hashing (MD5, SHA-256)\n2. Digital Signatures\n3. Configuration Management\n4. Version Control\n5. Message Authentication Codes (MACs).",
                  keyAspect: "Exam Focus: If a question mentions 'alteration', 'modification', or 'trustworthiness', think Integrity."
                },
                { 
                  id: "D1-A", label: "Availability", type: "detail", 
                  definition: "Ensuring that information and systems are accessible and usable on demand by authorized entities. It protects against system outages and resource exhaustion.",
                  example: "Exam Scenario: A massive DDoS attack floods a web server with junk traffic, making the e-commerce site unreachable for legitimate customers.",
                  enforcement: "Controls: \n1. Redundancy (RAID, Cluster, Dual-homing)\n2. High Availability (HA) configurations\n3. Patching and Maintenance\n4. DDoS Mitigation (IPS, WAF)\n5. Backups and Site Redundancy (Hot/Cold sites).",
                  keyAspect: "Exam Focus: Measured by SLAs. Key metrics: Uptime, MTTF, MTTR. Focus on 'Access' and 'Uptime'."
                }
              ]
            },
            { 
              id: "D1-DID", label: "Defense in Depth", type: "concept", 
              definition: "A layered approach to security where multiple controls are placed throughout an IT system. It is based on the premise that if one control fails, others remain to protect the asset.",
              example: "A company uses a firewall (Technical), a security guard (Physical), and an AUP policy (Administrative) to protect its data center.",
              enforcement: "Layers include:\n1. Administrative (Policies, Training)\n2. Physical (Locks, Guards)\n3. Technical (Firewalls, Encryption, MFA).",
              keyAspect: "Exam Tip: Also known as 'Layered Defense'. If one control fails, others remain to protect the asset."
            }
          ]
        },
        {
          id: "D1-GOV", label: "Security Governance", type: "subdomain",
          definition: "The framework of rules and practices by which the security program is directed and controlled.",
          children: [
            { 
              id: "D1-DOCS", label: "Documentation Hierarchy", type: "concept",
              definition: "The top-down approach to security management through standardized documentation.",
              children: [
                { 
                  id: "D1-POL", label: "Policies", type: "detail", 
                  definition: "The highest level of documentation. High-level management directives that outline the organization's security posture, goals, and principles. They are mandatory and should be non-technical.",
                  example: "Exam Scenario: Senior management issues a document stating that all employee communications are subject to monitoring. This is a foundational policy document.",
                  enforcement: "Steps:\n1. Signed by C-level executives.\n2. Reviewed annually.\n3. Communicated to all staff.\n4. Sets the tone for all other documents.",
                  keyAspect: "Exam Tip: Policies are the 'What' (High-level goals)."
                },
                { 
                  id: "D1-STD", label: "Standards", type: "detail", 
                  definition: "Specific, mandatory requirements for hardware and software configurations. They ensure uniformity across the organization.",
                  example: "Exam Scenario: IT mandates that all laptops must be encrypted using BitLocker with AES-256. This is a technical standard.",
                  enforcement: "Steps:\n1. Defined by technical leads.\n2. Enforced through GPOs or configuration management tools.\n3. Audited for compliance.",
                  keyAspect: "Exam Tip: Standards are 'Mandatory' and provide uniformity."
                },
                { 
                  id: "D1-BAS", label: "Baselines", type: "detail", 
                  definition: "The minimum level of security that every system throughout the organization must meet. It provides a common security 'floor'.",
                  example: "Exam Scenario: A company uses the NIST 800-53 security controls as the starting point for all new server deployments.",
                  enforcement: "Steps:\n1. Map to industry standards (NIST, CIS, ISO).\n2. Create 'Gold Images' or templates.\n3. Periodically verify using vulnerability scanners.",
                  keyAspect: "Exam Tip: Baselines represent the 'Minimum' security floor."
                },
                { 
                  id: "D1-GUI", label: "Guidelines", type: "detail", 
                  definition: "Non-mandatory recommendations or suggestions for best practices. They provide flexibility in achieving security goals.",
                  example: "Exam Scenario: A document suggests that users create passwords with at least one special character, although the system only requires 8 alphanumeric characters.",
                  enforcement: "Steps:\n1. Provide examples of 'good' behavior.\n2. Offer alternative methods to comply with policies.\n3. Educate users without strict enforcement.",
                  keyAspect: "Exam Tip: Guidelines are the only 'Non-Mandatory' document in this list."
                },
                { 
                  id: "D1-PRO", label: "Procedures", type: "detail", 
                  definition: "Step-by-step tactical instructions on how to perform a specific task. They are the most granular and technical level of documentation.",
                  example: "Exam Scenario: A help desk technician follows a 10-step checklist to reset a user's password and verify their identity.",
                  enforcement: "Steps:\n1. Written as step-by-step guides.\n2. Often visualized in flowcharts.\n3. Used for training and audit trails.",
                  keyAspect: "Exam Tip: Procedures are the 'How-To' (Step-by-step)."
                }
              ]
            },
            { 
              id: "D1-ROLES", label: "Roles & Responsibilities", type: "concept",
              definition: "Defining who is responsible for what within the security hierarchy.",
              example: "The Data Owner decides classification; the Data Custodian implements the backups.",
              enforcement: "Organizational charts and job descriptions.",
              keyAspect: "Exam Tip: Senior Management is ultimately 'Liable'. Data Owner is responsible for the 'Asset'."
            }
          ]
        },
        {
          id: "D1-LEGAL", label: "Legal & Regulatory", type: "subdomain",
          definition: "Understanding the legal framework and compliance requirements for security professionals.",
          children: [
            { 
              id: "D1-LAW", label: "Legal Systems", type: "concept",
              definition: "The different types of laws that govern behavior and business.",
              children: [
                { 
                  id: "D1-CRIM", label: "Criminal Law", type: "detail", 
                  definition: "Laws dealing with crimes against society where the victim is 'The Public'. The goal is punishment and deterrence.",
                  example: "Exam Scenario: A hacker is prosecuted by the FBI for violating the CFAA (Computer Fraud and Abuse Act) by stealing government secrets.",
                  enforcement: "Penalties: Imprisonment and fines.\nBurden of proof: Beyond a reasonable doubt.\nKey focus: Societal protection.",
                  keyAspect: "Exam Tip: Focus is on 'Punishment'."
                },
                { 
                  id: "D1-CIV", label: "Civil (Tort) Law", type: "detail", 
                  definition: "Laws governing disputes between individuals or organizations. The goal is compensation for damages.",
                  example: "Exam Scenario: Company A sues Company B for 'patent infringement' because a product looks identical to their own.",
                  enforcement: "Penalties: Financial damages (Compensatory/Punitive).\nBurden of proof: Preponderance of the evidence.\nKey focus: Dispute resolution.",
                  keyAspect: "Exam Tip: Focus is on 'Compensation'."
                },
                { 
                  id: "D1-ADM", label: "Administrative Law", type: "detail", 
                  definition: "Rules and regulations enacted by government agencies to regulate industries (e.g., FDA, SEC, FCC).",
                  example: "Exam Scenario: A bank is fined by the SEC for failing to implement proper transaction logging as required by financial regulations.",
                  enforcement: "Penalties: Regulatory fines and loss of operating licenses.\nEnforced by: Government agencies.\nKey focus: Industry compliance.",
                  keyAspect: "Exam Tip: Think 'Agency Regulations'."
                }
              ]
            },
            { 
              id: "D1-IP", label: "Intellectual Property", type: "concept",
              definition: "Legal protections for creations of the mind and proprietary business assets.",
              children: [
                { 
                  id: "D1-PAT", label: "Patents", type: "detail", 
                  definition: "Protects inventions. The invention must be Novel, Useful, and Non-obvious. It grants an exclusive right to the invention for a fixed period.",
                  example: "Exam Scenario: A pharmaceutical company spends 10 years and $1B to create a new heart medication and files for a 20-year monopoly.",
                  enforcement: "Term: 20 years from filing.\nRequires: Public disclosure of how the invention works.\nDefense: Infringement lawsuits.",
                  keyAspect: "Exam Tip: Duration is 20 years from the date of filing."
                },
                { 
                  id: "D1-COP", label: "Copyrights", type: "detail", 
                  definition: "Protects the expression of an idea, not the idea itself. Applies to literary, musical, and artistic works, including software source code.",
                  example: "Exam Scenario: An author writes a security study guide. A pirate site hosts the PDF for free. This is a copyright violation.",
                  enforcement: "Term: Author's life + 70 years (or 95 years for corporations).\nAutomatic: Upon creation (though registration helps in court).\nDefense: DMCA take-downs.",
                  keyAspect: "Exam Tip: Duration: Author's life + 70 years (or 95 years for corporations)."
                },
                { 
                  id: "D1-TM", label: "Trademarks", type: "detail", 
                  definition: "Protects brand identity, including logos, names, slogans, and sounds that distinguish goods or services.",
                  example: "Exam Scenario: A small burger joint uses a 'Golden Arches' logo. McDonald's sues because it causes brand confusion.",
                  enforcement: "Term: 10 years (Renewable indefinitely).\nRequirement: Must be actively used in commerce.\nSymbols: ® (Registered), ™ (Unregistered).",
                  keyAspect: "Exam Tip: Trademarks can last indefinitely as long as they are in use."
                },
                { 
                  id: "D1-TS", label: "Trade Secrets", type: "detail", 
                  definition: "Proprietary information that provides a competitive edge and is kept confidential through reasonable efforts. No public filing is required.",
                  example: "Exam Scenario: An employee steals the 'secret recipe' for a soft drink and tries to sell it to a competitor. This is a theft of trade secrets.",
                  enforcement: "Mechanisms:\n1. NDAs (Non-Disclosure Agreements)\n2. Non-compete clauses\n3. Strict physical and logical access controls.\n4. Termination exit interviews.",
                  keyAspect: "Exam Tip: Protection ends immediately if the secret is publicly disclosed."
                }
              ]
            },
            { 
              id: "D1-PRIV", label: "Privacy Laws", type: "concept", 
              definition: "Regulations governing the collection and use of Personal Identifiable Information (PII).",
              example: "GDPR (Europe), HIPAA (US Healthcare), GLBA (US Finance).",
              enforcement: "Heavy fines for non-compliance (e.g., 4% of global turnover for GDPR).",
              keyAspect: "Exam Tip: GDPR requires breach notification within 72 hours."
            }
          ]
        },
        {
          id: "D1-ETHICS", label: "Professional Ethics", type: "subdomain",
          definition: "The moral principles and standards that govern the conduct of security professionals.",
          children: [
            { 
              id: "D1-ISC2-ETH", label: "ISC2 Code of Ethics", type: "concept",
              definition: "The mandatory ethical code for all CISSP candidates and members.",
              children: [
                { 
                  id: "D1-CAN1", label: "Protect Society", type: "detail", 
                  definition: "Priority 1: Protect society, the common good, necessary public trust and confidence, and the infrastructure.",
                  example: "Exam Scenario: You discover a flaw in a national power grid's software. Your client wants to hide it to avoid bad PR. You must report it because societal safety comes first.",
                  enforcement: "Mandatory Canon: Public safety and trust take precedence over corporate or personal interests.",
                  keyAspect: "Exam Tip: This is the HIGHEST priority canon. Public safety comes first."
                },
                { 
                  id: "D1-CAN2", label: "Act Honorably", type: "detail", 
                  definition: "Priority 2: Act honorably, honestly, justly, responsibly, and legally.",
                  example: "Exam Scenario: A colleague asks you to help them cheat on a certification exam. Refusing is an act of acting honorably and justly.",
                  enforcement: "Mandatory Canon: Requires compliance with all laws and high standards of personal behavior.",
                  keyAspect: "Exam Tip: Focuses on honesty and legal compliance."
                },
                { 
                  id: "D1-CAN3", label: "Provide Diligent Service", type: "detail", 
                  definition: "Priority 3: Provide diligent and competent service to principals (clients/employers).",
                  example: "Exam Scenario: You are hired to do a pentest. You must complete the full scope agreed upon, even if it takes more effort than anticipated.",
                  enforcement: "Mandatory Canon: Professional loyalty to your employer/client as long as it doesn't violate Canons 1 or 2.",
                  keyAspect: "Exam Tip: Loyalty to your employer/client, as long as it doesn't violate Canons 1 or 2."
                },
                { 
                  id: "D1-CAN4", label: "Advance Profession", type: "detail", 
                  definition: "Priority 4: Advance and protect the profession.",
                  example: "Exam Scenario: You volunteer to mentor junior security analysts or contribute to open-source security research.",
                  enforcement: "Mandatory Canon: Maintaining the reputation of the CISSP certification and the security field as a whole.",
                  keyAspect: "Exam Tip: Maintaining the reputation of the CISSP certification."
                }
              ]
            }
          ]
        },
        {
          id: "D1-RISK-MGMT", label: "Risk Management", type: "subdomain",
          definition: "The process of identifying, assessing, and responding to risks to achieve organizational goals.",
          children: [
            { 
              id: "D1-ANALYSIS", label: "Risk Analysis", type: "concept",
              definition: "Evaluating the potential impact and likelihood of risks.",
              children: [
                { 
                  id: "D1-QUAN", label: "Quantitative", type: "detail", 
                  definition: "Numerical analysis of risk using dollar values and objective data. It uses mathematical formulas to calculate ALE (Annualized Loss Expectancy).",
                  example: "Exam Scenario: Calculate ALE for a $1M data center where a fire (EF=0.25) is expected once every 50 years (ARO=0.02). SLE=$250k. ALE=$5k.",
                  enforcement: "Formulas:\n1. SLE (Single Loss Expectancy) = Asset Value * Exposure Factor (EF)\n2. ALE (Annualized Loss Expectancy) = SLE * Annual Rate of Occurrence (ARO).",
                  keyAspect: "Exam Tip: Know the formula: SLE x ARO = ALE."
                },
                { 
                  id: "D1-QUAL", label: "Qualitative", type: "detail", 
                  definition: "Subjective analysis based on scenarios, professional judgment, and experience. It ranks risks using labels like 'High', 'Medium', or 'Low'.",
                  example: "Exam Scenario: A security team uses a 5x5 matrix to plot the 'Reputational Impact' of a hack versus the 'Likelihood' of occurrence.",
                  enforcement: "Tools:\n1. Brainstorming / Delphi Technique\n2. Interviews and Focus Groups\n3. Heat Maps (Probability vs Impact matrices).",
                  keyAspect: "Exam Tip: Often uses a Heat Map (Probability vs. Impact matrix)."
                }
              ]
            },
            { 
              id: "D1-RESP", label: "Risk Response", type: "concept",
              definition: "How management chooses to handle a identified risk.",
              children: [
                { 
                  id: "D1-RE-MIT", label: "Mitigation", type: "detail", 
                  definition: "Implementing controls to reduce risk to an acceptable level. It aims to decrease the likelihood or impact of a threat.",
                  example: "Exam Scenario: To address the risk of fire, the company installs a pre-action sprinkler system and fire-rated doors.",
                  enforcement: "Controls:\n1. Technical (Firewalls, IDS)\n2. Physical (Fences, Cameras)\n3. Administrative (Training).",
                  keyAspect: "Exam Tip: Most common response. Reduces Likelihood or Impact."
                },
                { 
                  id: "D1-RE-TRA", label: "Transference", type: "detail", 
                  definition: "Shifting the burden of the risk to a third party. Usually involves a financial agreement.",
                  example: "Exam Scenario: A company decides that a $1M potential breach cost is too high to bear alone and buys a Cyber Insurance policy.",
                  enforcement: "Methods:\n1. Insurance policies\n2. Outsourcing with liability clauses\n3. SLAs with penalty clauses.",
                  keyAspect: "Exam Tip: Also known as 'Risk Sharing' or 'Assigning'."
                },
                { 
                  id: "D1-RE-ACC", label: "Acceptance", type: "detail", 
                  definition: "Management formally decides to live with the risk. This usually happens when the cost of mitigation exceeds the potential loss.",
                  example: "Exam Scenario: The risk of a meteorite hitting the data center is so low that management signs off on it without adding protection.",
                  enforcement: "Requirements:\n1. Risk must be identified and analyzed.\n2. Must be formally documented.\n3. Must be signed off by a manager with budget authority.",
                  keyAspect: "Exam Tip: Residual Risk must be documented and signed by management."
                },
                { 
                  id: "D1-RE-AVO", label: "Avoidance", type: "detail", 
                  definition: "Terminating the activity or avoiding the location that creates the risk. It eliminates the risk entirely.",
                  example: "Exam Scenario: A company decides not to open a branch office in a high-crime area to 'avoid' the risk of robbery.",
                  enforcement: "Steps:\n1. Cancel projects.\n2. Sell business units.\n3. Discontinue services.",
                  keyAspect: "Exam Tip: The only way to reduce risk to ZERO."
                }
              ]
            }
          ]
        },
        {
          id: "D1-BCM", label: "Business Continuity", type: "subdomain",
          definition: "Ensuring that critical business functions continue during and after a disaster.",
          children: [
            { 
              id: "D1-BIA", label: "BIA Metrics", type: "concept",
              definition: "Mathematical targets used to define recovery objectives.",
              children: [
                { 
                  id: "D1-MTD", label: "MTD", type: "detail", 
                  definition: "Maximum Tolerable Downtime: The absolute maximum time a business process can be down before irreparable damage or bankruptcy occurs.",
                  example: "Exam Scenario: If the billing system is down for more than 48 hours, the company will run out of cash and fail. MTD = 48 hours.",
                  enforcement: "Calculated as: RTO (Recovery Time Objective) + WRT (Work Recovery Time).",
                  keyAspect: "Exam Tip: MTD is the 'Ceiling'. RTO + WRT must be less than MTD."
                },
                { 
                  id: "D1-RTO", label: "RTO", type: "detail", 
                  definition: "Recovery Time Objective: The target time for restoring a system to an operational state. It is an IT-centric metric.",
                  example: "Exam Scenario: IT must have the email server back up and running within 4 hours of a hardware failure.",
                  enforcement: "Measured from: Moment of disaster until 'System Operational'.",
                  keyAspect: "Exam Tip: Time from disaster to 'System Operational'."
                },
                { 
                  id: "D1-RPO", label: "RPO", type: "detail", 
                  definition: "Recovery Point Objective: The maximum amount of data loss (measured in time) the business can tolerate. It dictates backup frequency.",
                  example: "Exam Scenario: A bank can only lose 15 minutes of transactions. Therefore, they must replicate data or backup every 15 minutes.",
                  enforcement: "Measured from: Moment of disaster backward to the 'last good backup'.",
                  keyAspect: "Exam Tip: RPO dictates backup frequency."
                }
              ]
            }
          ]
        },
        {
          id: "D1-THREAT", label: "Threat Modeling", type: "subdomain",
          definition: "Proactively identifying potential threats to a system or organization.",
          children: [
            { 
              id: "D1-STRIDE", label: "STRIDE Model", type: "concept",
              definition: "A model developed by Microsoft to categorize types of threats.",
              children: [
                { id: "D1-S", label: "Spoofing", type: "detail", definition: "Pretending to be someone or something else.", enforcement: "Mitigation: MFA, Digital Signatures, IPsec.", keyAspect: "Violates: Authentication." },
                { id: "D1-T", label: "Tampering", type: "detail", definition: "Modifying data or code without authorization.", enforcement: "Mitigation: Hashing, ACLs, Write-once media.", keyAspect: "Violates: Integrity." },
                { id: "D1-R", label: "Repudiation", type: "detail", definition: "Denying that an action was performed or that a message was sent.", enforcement: "Mitigation: Digital Signatures, Detailed Logging.", keyAspect: "Violates: Accountability." },
                { id: "D1-I-INFO", label: "Information Disclosure", type: "detail", definition: "Leaking data to unauthorized parties.", enforcement: "Mitigation: Encryption, Data Masking, DLP.", keyAspect: "Violates: Confidentiality." },
                { id: "D1-D-DOS", label: "Denial of Service", type: "detail", definition: "Crashing a system or making it unavailable to legitimate users.", enforcement: "Mitigation: Redundancy, Throttling, Load Balancing.", keyAspect: "Violates: Availability." },
                { id: "D1-E", label: "Elevation of Privilege", type: "detail", definition: "Gaining higher-level access than authorized (e.g., User to Admin).", enforcement: "Mitigation: Least Privilege, Sandboxing, ASLR.", keyAspect: "Violates: Authorization." }
              ]
            }
          ]
        },
        {
          id: "D1-PERS", label: "Personnel Security", type: "subdomain",
          definition: "Managing security risks related to the people within the organization.",
          children: [
            { id: "D1-ONB", label: "Onboarding/Hiring", type: "concept", definition: "Background checks, NDAs, and security awareness training during hire.", keyAspect: "Preventative control." },
            { id: "D1-TERM", label: "Termination", type: "concept", definition: "Immediate access revocation and exit interviews.", keyAspect: "Administrative control." },
            { 
              id: "D1-MV", label: "Mandatory Vacations", type: "detail", 
              definition: "Requiring employees to take 1-2 consecutive weeks off per year. It is a detective control designed to uncover internal fraud.",
              example: "Exam Scenario: While a financial admin is away on a 2-week mandatory vacation, a temporary replacement discovers a discrepancy in the logs.",
              enforcement: "Controls: \n1. Policy requiring vacation.\n2. Revocation of remote access during the period.\n3. Assigning duties to another staff member.",
              keyAspect: "Exam Tip: Primary purpose is DETECTIVE (detecting fraud)."
            },
            { 
              id: "D1-JR", label: "Job Rotation", type: "detail", 
              definition: "Moving employees between different job functions periodically. It is both a detective and preventative control.",
              example: "Exam Scenario: Every 6 months, the network admins trade roles with the server admins to cross-train and ensure no one has 'too much power' for too long.",
              enforcement: "Controls:\n1. Cross-training programs.\n2. Periodic review of access rights.\n3. Documentation of multiple job functions.",
              keyAspect: "Exam Tip: Prevents collusion and single point of failure. Primary purpose: Detective/Training."
            }
          ]
        }
      ] 
    },
    { 
      id: "D2", 
      label: "Domain 2: Asset Security", 
      type: "domain", 
      color: MM_COLORS.DOMAIN2,
      definition: "Focuses on the identification, classification, and protection of information and physical assets throughout their entire lifecycle.",
      keyAspect: "Data Classification is the single most important driver for all other security controls in this domain.",
      children: [
        {
          id: "D2-LIFE", label: "Information & Asset Lifecycle", type: "subdomain",
          definition: "Data must be protected differently depending on its phase in the lifecycle.",
          children: [
            { 
              id: "D2-CREATE", label: "Creation / Collection", type: "detail", 
              definition: "Initial phase where data is generated, discovered, or acquired by the organization.",
              example: "Exam Scenario: A researcher saves a new proprietary formula to a shared drive. They must classify it 'Secret' immediately to trigger protective controls.",
              enforcement: "Controls: Digital signatures, automatic tagging based on keywords, classification headers, metadata enrichment.",
              keyAspect: "Exam Tip: Classification should occur at the moment of creation for maximum protection." 
            },
            { 
              id: "D2-STORE", label: "Storage", type: "detail", 
              definition: "Phase where data is committed to non-volatile media (HDD, SSD, Tape, Cloud).",
              example: "Exam Scenario: Encrypting backup tapes before they are transported to an off-site vault by a third-party courier.",
              enforcement: "Controls: AES-256 bit encryption (Data at Rest), physical access controls to the server room, storage-based ACLs.",
              keyAspect: "Exam Tip: Encryption is the primary control for data in the Storage phase." 
            },
            { 
              id: "D2-USE", label: "Usage", type: "detail", 
              definition: "Phase where data is being actively processed in memory (RAM) or CPU registers.",
              example: "Exam Scenario: A payroll application processes salaries in RAM. The OS must ensure other processes cannot read the application's memory space.",
              enforcement: "Controls: Memory isolation, Address Space Layout Randomization (ASLR), Trusted Execution Environments (TEE), Data Enclaves.",
              keyAspect: "Exam Tip: Data is most vulnerable in the 'Use' state because it is typically decrypted." 
            },
            { 
              id: "D2-SHARE", label: "Sharing", type: "detail", 
              definition: "Phase where data is communicated to internal or external entities.",
              example: "Exam Scenario: A salesperson sends a customer list to a marketing agency. The DLP system must check for PII before allowing the transfer.",
              enforcement: "Controls: TLS 1.3, Data Loss Prevention (DLP), Information Rights Management (IRM), secure file transfer portals.",
              keyAspect: "Exam Tip: Focus on secure transport and preventing unauthorized exfiltration." 
            },
            { 
              id: "D2-ARCHIVE", label: "Archive", type: "detail", 
              definition: "Long-term storage of data that is no longer in active use but must be retained for legal, historical, or regulatory reasons.",
              example: "Exam Scenario: An organization keeps financial records for 7 years on WORM (Write Once Read Many) drives to meet tax compliance.",
              enforcement: "Controls: Integrity checking (hashing), WORM media, physical vaulting, restoration testing.",
              keyAspect: "Exam Tip: Archives must ensure data remains readable and uncorrupted over long durations." 
            },
            { 
              id: "D2-DESTROY", label: "Destruction", type: "detail", 
              definition: "Final phase where data is permanently removed to prevent recovery.",
              example: "Exam Scenario: After the 7-year retention period ends, the organization physically shreds the backup tapes and provides a Certificate of Destruction.",
              enforcement: "Controls: Physical shredding, incineration, degaussing (magnetic only), lab-grade wiping.",
              keyAspect: "Exam Tip: Objective is zero 'Data Remanence'." 
            }
          ]
        },
        {
          id: "D2-CLASS", label: "Data Classification", type: "subdomain",
          definition: "Categorizing data based on its sensitivity and impact of disclosure.",
          children: [
            {
              id: "D2-MIL", label: "Military / Government Labels", type: "concept",
              definition: "Standardized levels for national security information.",
              children: [
                { 
                  id: "D2-TS", label: "Top Secret", type: "detail", 
                  definition: "The highest level of classification for national security information.",
                  example: "Exam Scenario: Disclosure of this data would cause 'Exceptionally Grave Damage' to national security (e.g., nuclear launch codes).",
                  enforcement: "Controls: SCIFs (Sensitive Compartmented Information Facilities), strict TPI (Two-Person Integrity), physical guards.",
                  keyAspect: "Exam Tip: Key phrase is 'Exceptionally Grave Damage'." 
                },
                { 
                  id: "D2-S", label: "Secret", type: "detail", 
                  definition: "Information that requires a substantial degree of protection.",
                  example: "Exam Scenario: Disclosure would cause 'Serious Damage' to national security (e.g., troop deployment maps).",
                  enforcement: "Controls: Strong encryption, vetted personnel with Secret clearance, secure cabinets.",
                  keyAspect: "Exam Tip: Key phrase is 'Serious Damage'." 
                },
                { 
                  id: "D2-C", label: "Confidential", type: "detail", 
                  definition: "The lowest level of classified information in the government hierarchy.",
                  example: "Exam Scenario: Disclosure would cause 'Damage' to national security (e.g., diplomatic memos).",
                  enforcement: "Controls: Standard background checks, standard physical locks, basic encryption.",
                  keyAspect: "Exam Tip: Key phrase is 'Damage'." 
                },
                { 
                  id: "D2-U", label: "Unclassified", type: "detail", 
                  definition: "Information that does not meet the criteria for classification but may still have distribution restrictions.",
                  example: "Exam Scenario: A public service announcement or an internal cafeteria menu. Some may be marked FOUO (For Official Use Only).",
                  enforcement: "Controls: Public release procedures, basic protection against unauthorized modification.",
                  keyAspect: "Exam Tip: FOUO is technically unclassified but restricted." 
                }
              ]
            },
            {
              id: "D2-CORP", label: "Commercial / Private Labels", type: "concept",
              definition: "Labels used by private organizations to protect business assets.",
              children: [
                { 
                  id: "D2-PRO", label: "Proprietary / Confidential", type: "detail", 
                  definition: "Information that is critical to the organization's business survival or competitive edge.",
                  example: "Exam Scenario: The secret formula for a soft drink or a roadmap for a new microchip architecture.",
                  enforcement: "Controls: NDAs, encryption, IP protection, strict 'Need-to-Know' access.",
                  keyAspect: "Exam Tip: Equivalent to 'Secret/Top Secret' in terms of business impact." 
                },
                { 
                  id: "D2-PRI", label: "Private", type: "detail", 
                  definition: "Personal data about employees or customers (PII/PHI).",
                  example: "Exam Scenario: Employee payroll records, medical histories, or Social Security numbers.",
                  enforcement: "Controls: GDPR compliance, HIPAA controls, masking, tokenization.",
                  keyAspect: "Exam Tip: Focus is on privacy regulations and individual rights." 
                },
                { 
                  id: "D2-SEN", label: "Sensitive", type: "detail", 
                  definition: "Internal data that is not public but has lower sensitivity than Proprietary data.",
                  example: "Exam Scenario: Internal project schedules, organization charts, or policy drafts.",
                  enforcement: "Controls: Internal ACLs, standard passwords, 'Internal Use Only' watermarks.",
                  keyAspect: "Exam Tip: Disclosure results in embarrassment or minor business disruption." 
                },
                { 
                  id: "D2-PUB", label: "Public", type: "detail", 
                  definition: "Information approved for unrestricted public release.",
                  example: "Exam Scenario: Product brochures, marketing videos, and press releases.",
                  enforcement: "Controls: Integrity checks to prevent unauthorized defacement.",
                  keyAspect: "Exam Tip: No negative impact from disclosure." 
                }
              ]
            }
          ]
        },
        {
          id: "D2-ROLES", label: "Ownership & Roles", type: "subdomain",
          definition: "Defining responsibility for data and asset protection.",
          children: [
            { 
              id: "D2-OWN", label: "Data Owner", type: "detail", 
              definition: "Senior management official responsible for the asset. They have ultimate legal liability.",
              example: "Exam Scenario: The CFO is the Data Owner for the financial records. They decide that the data should be classified as 'Proprietary'.",
              enforcement: "Steps: Determine classification, review access entitlements periodically, delegate custodial tasks.",
              keyAspect: "Exam Tip: The owner decides the 'Classification Level'." 
            },
            { 
              id: "D2-CUS", label: "Data Custodian", type: "detail", 
              definition: "Technical staff responsible for implementing the protection determined by the Data Owner.",
              example: "Exam Scenario: A Database Administrator (DBA) who performs the daily backups and configures the SQL encryption.",
              enforcement: "Steps: Perform backups, ensure integrity, implement encryption, configure ACLs per policy.",
              keyAspect: "Exam Tip: The custodian implements the 'Technical Controls'." 
            },
            { 
              id: "D2-PRO-CON", label: "Controller vs Processor", type: "concept", 
              definition: "GDPR definitions for privacy management.",
              children: [
                { 
                  id: "D2-CON", label: "Controller", type: "detail", 
                  definition: "The legal entity that determines the 'why' and 'how' of data processing.",
                  example: "Exam Scenario: An e-commerce company that collects user data to process orders.",
                  enforcement: "Steps: Ensure privacy by design, manage user consent, report breaches to regulators.",
                  keyAspect: "Exam Tip: The Controller holds the primary liability for privacy." 
                },
                { 
                  id: "D2-PRO-GDPR", label: "Processor", type: "detail", 
                  definition: "The entity that processes data strictly on behalf of the controller.",
                  example: "Exam Scenario: A cloud service provider (e.g., AWS) that hosts the database for the e-commerce company.",
                  enforcement: "Steps: Provide technical security measures, process only on instruction, allow audits.",
                  keyAspect: "Exam Tip: Must follow the Controller's written instructions." 
                }
              ]
            }
          ]
        },
        {
          id: "D2-SAN", label: "Media Sanitization", type: "subdomain",
          definition: "Techniques for ensuring data cannot be recovered from discarded media.",
          children: [
            { 
              id: "D2-CLR", label: "Clearing", type: "detail", 
              definition: "Logical removal of data for reuse within the organization.",
              example: "Exam Scenario: Overwriting a hard drive with 0s before giving the laptop to a new employee in the same department.",
              enforcement: "Controls: Formatting (High-level), overwriting with a single pass of bits.",
              keyAspect: "Exam Tip: Not effective against lab-grade recovery tools." 
            },
            { 
              id: "D2-PUR", label: "Purging", type: "detail", 
              definition: "Removal so data cannot be recovered even by sophisticated lab techniques.",
              example: "Exam Scenario: Using a degausser on a magnetic HDD or the 'ATA Secure Erase' command on an SSD.",
              enforcement: "Controls: Degaussing, cryptowiping, secure erase commands.",
              keyAspect: "Exam Tip: NIST 800-88 standard. Essential for media leaving a secure boundary." 
            },
            { 
              id: "D2-DEST", label: "Destruction", type: "detail", 
              definition: "Physical destruction of the media rendering it unusable and unrecoverable.",
              example: "Exam Scenario: Feeding hard drive platters into a industrial shredder.",
              enforcement: "Controls: Shredding, incineration, pulverizing, acid bathing.",
              keyAspect: "Exam Tip: The most secure method of sanitization." 
            }
          ]
        },
        {
          id: "D2-PROTECT", label: "Data Protection Controls", type: "subdomain",
          definition: "Technical and administrative measures to secure data.",
          children: [
            { 
              id: "D2-DLP", label: "Data Loss Prevention (DLP)", type: "detail", 
              definition: "Systems designed to detect and prevent unauthorized transmission of sensitive data.",
              example: "Exam Scenario: A network DLP system detects a credit card number in an outgoing Gmail message and blocks the email.",
              enforcement: "Controls: Endpoint DLP (agents), Network DLP (gateways), Storage DLP (scanning at rest).",
              keyAspect: "Exam Tip: DLP relies on content discovery and inspection rules." 
            },
            { 
              id: "D2-STATES", label: "Data States", type: "concept", 
              children: [
                { 
                  id: "D2-REST", label: "At Rest", type: "detail", 
                  definition: "Data stored on non-volatile media.",
                  example: "Exam Scenario: Protecting the company's SQL database stored on an encrypted SAN.",
                  enforcement: "Controls: AES encryption, database field encryption, physical security.",
                  keyAspect: "Exam Tip: Easiest state to protect via encryption." 
                },
                { 
                  id: "D2-TRANSIT", label: "In Transit", type: "detail", 
                  definition: "Data moving over a network.",
                  example: "Exam Scenario: Using a VPN to connect a remote worker to the corporate file server.",
                  enforcement: "Controls: TLS 1.3, IPsec (ESP), SSH, HTTPS.",
                  keyAspect: "Exam Tip: Protects against 'Man-in-the-Middle' attacks." 
                },
                { 
                  id: "D2-INUSE", label: "In Use", type: "detail", 
                  definition: "Data in volatile memory (RAM) being processed.",
                  example: "Exam Scenario: An encryption key is temporarily loaded into CPU registers to perform a calculation.",
                  enforcement: "Controls: Enclaves, process isolation, memory scrubbing.",
                  keyAspect: "Exam Tip: The state where data is most 'exposed' to memory-reading malware." 
                }
              ]
            }
          ]
        }
      ]
    },
    { 
      id: "D3", 
      label: "Domain 3: Architecture & Engineering", 
      type: "domain", 
      color: MM_COLORS.DOMAIN3,
      definition: "Focuses on engineering secure systems through security models, hardware architecture, cryptography, and physical environment design.",
      keyAspect: "Multi-layered approach combining technical architecture, secure design principles, and cryptography.",
      children: [
        {
          id: "D3-MODELS", label: "Security Models", type: "subdomain",
          definition: "Formal descriptions of security policies and rules for information systems.",
          children: [
            { 
              id: "D3-BLP", label: "Bell-LaPadula", type: "concept", 
              definition: "A state-machine model focused on Confidentiality. It ensures that information only flows from a lower security level to a higher or equal level.",
              enforcement: "Rules: \n1. Simple Security Property (No Read Up)\n2. *-Property (No Write Down)\n3. Strong Star Property (No Read/Write except at same level).",
              example: "Exam Scenario: A user with 'Secret' clearance attempts to read a 'Top Secret' document. The Bell-LaPadula model blocks this via the Simple Security Property.",
              keyAspect: "Exam Tip: Protects secrets. Focus: Confidentiality. Remember: NRU/NWD."
            },
            { 
              id: "D3-BIBA", label: "Biba Integrity Model", type: "concept", 
              definition: "A state-machine model focused on Integrity. It prevents information from flowing from a lower integrity level to a higher one, preventing contamination.",
              enforcement: "Rules: \n1. Simple Integrity Axiom (No Read Down)\n2. *-Integrity Axiom (No Write Up)\n3. Invocation Property (Subject at level L cannot invoke subject at level > L).",
              example: "Exam Scenario: A low-integrity 'public' process attempts to overwrite a high-integrity 'system' file. Biba blocks this via the *-Integrity Axiom.",
              keyAspect: "Exam Tip: Prevents contamination of high-integrity data. Focus: Integrity. Remember: NRD/NWU."
            },
            { 
              id: "D3-CW", label: "Clark-Wilson", type: "concept", 
              definition: "A model designed for commercial applications that focuses on Integrity through well-formed transactions and separation of duties.",
              enforcement: "Mechanisms: \n1. Constrained Data Items (CDIs)\n2. Transformation Procedures (TPs)\n3. Integrity Verification Procedures (IVPs)\n4. Triplets (Subject, Program, Object).",
              example: "Exam Scenario: An accounting clerk can only modify the ledger through a specific, audited transaction application (TP), ensuring that they cannot directly manipulate data files.",
              keyAspect: "Exam Tip: Focus: Separation of Duties and well-formed transactions. Uses 'Triplets'."
            },
            { 
              id: "D3-BN", label: "Brewer-Nash (Chinese Wall)", type: "concept", 
              definition: "A model that dynamically changes access permissions based on a user's previous actions to prevent conflicts of interest.",
              enforcement: "Mechanisms: \n1. Conflict Classes (sets of competing companies)\n2. Dataset Access Logs (tracking what was seen)\n3. Dynamic ACLs.",
              example: "Exam Scenario: A consultant who has worked for Bank A is automatically barred from accessing files for Bank B because they are in the same conflict class.",
              keyAspect: "Exam Tip: Used in consulting/legal firms to prevent Conflict of Interest (COI)."
            }
          ]
        },
        {
          id: "D3-CRYPTO", label: "Cryptography", type: "subdomain",
          definition: "Protecting information by transforming it into unreadable formats using mathematical algorithms.",
          children: [
            { 
              id: "D3-SYM", label: "Symmetric Encryption", type: "concept", 
              definition: "A single shared key is used for both encryption and decryption. Requires secure key exchange.",
              children: [
                { 
                  id: "D3-AES", label: "AES", type: "detail", 
                  definition: "Advanced Encryption Standard. A block cipher that replaced DES. It is highly efficient and considered secure for Top Secret government data.",
                  enforcement: "Parameters: \n1. Blocks: 128-bit\n2. Keys: 128, 192, 256-bit\n3. Algorithm: Rijndael.",
                  example: "Exam Scenario: A cloud provider needs to encrypt petabytes of data at rest efficiently. AES-256 is selected for its high speed and strong security.",
                  keyAspect: "Fast, used for bulk data. Winner of NIST competition." 
                },
                { 
                  id: "D3-DES", label: "DES / 3DES", type: "detail", 
                  definition: "Legacy block ciphers. DES is broken due to small key size. 3DES applies DES three times for improved security but is slow.",
                  enforcement: "Parameters: \n1. DES: 56-bit effective key\n2. 3DES: 112 or 168-bit effective key\n3. Block size: 64-bit.",
                  example: "Exam Scenario: An old ATM network still uses 3DES because the hardware doesn't support AES. The organization must plan for migration.",
                  keyAspect: "Being phased out. 3DES is the 'stop-gap' for legacy systems." 
                }
              ],
              keyAspect: "Fastest. Scalability is a problem (n*(n-1)/2 keys)."
            },
            { 
              id: "D3-ASYM", label: "Asymmetric Encryption", type: "concept", 
              definition: "Uses a pair of keys: a Public key for encryption/verification and a Private key for decryption/signing.",
              children: [
                { 
                  id: "D3-RSA", label: "RSA", type: "detail", 
                  definition: "The most widely used asymmetric algorithm, based on the difficulty of factoring the product of two large prime numbers.",
                  enforcement: "Usage: Key transport, digital signatures, web encryption (TLS).",
                  example: "Exam Scenario: A web server provides its RSA Public Key in a certificate so that a browser can encrypt a symmetric session key for a TLS tunnel.",
                  keyAspect: "Most common for digital signatures and key exchange." 
                },
                { 
                  id: "D3-ECC", label: "ECC", type: "detail", 
                  definition: "Elliptic Curve Cryptography. Uses smaller keys than RSA to provide equivalent security levels, making it faster and more efficient.",
                  enforcement: "Usage: Mobile devices, smart cards, IoT devices.",
                  example: "Exam Scenario: An IoT developer needs to implement strong encryption on a low-power sensor. ECC-256 is chosen over RSA-3072 for its efficiency.",
                  keyAspect: "Best for mobile/low-power devices due to efficiency." 
                },
                { 
                  id: "D3-DH", label: "Diffie-Hellman", type: "detail", 
                  definition: "A key agreement protocol that allows two parties to establish a shared symmetric key over an insecure channel.",
                  enforcement: "Constraint: Does not provide authentication or confidentiality by itself.",
                  example: "Exam Scenario: Two routers use Diffie-Hellman to create a shared key for an IPsec tunnel without ever sending the key over the wire.",
                  keyAspect: "Key Exchange ONLY. Does not encrypt or sign data." 
                }
              ],
              keyAspect: "Slower but scales perfectly (2*n keys)."
            },
            { 
              id: "D3-PKI", label: "PKI & Digital Signatures", type: "detail", 
              definition: "The framework of hardware, software, people, and policies required to manage digital certificates.",
              enforcement: "Components: \n1. CA (Certificate Authority)\n2. RA (Registration Authority)\n3. CRL (Revocation List)\n4. OCSP (Online status check).",
              example: "Exam Scenario: A user receives a signed email. Their client checks the CA's CRL to ensure the sender's certificate hasn't been revoked.",
              keyAspect: "Digital Signatures provide: Authenticity, Integrity, Non-repudiation."
            },
            { 
              id: "D3-HASH", label: "Hashing", type: "detail", 
              definition: "A one-way mathematical function that transforms any amount of data into a fixed-length string (fingerprint).",
              enforcement: "Algorithms: SHA-256, SHA-3, MD5 (deprecated). Must be collision-resistant.",
              example: "Exam Scenario: A software developer provides a SHA-256 hash next to a download link so users can verify the file wasn't tampered with.",
              keyAspect: "Provides Integrity ONLY. Irreversible."
            }
          ]
        },
        {
          id: "D3-ARCH", label: "System Architecture", type: "subdomain",
          definition: "The design principles used to build secure hardware and software systems.",
          children: [
            { 
              id: "D3-RING", label: "Ring Architecture", type: "concept", 
              definition: "A hardware-enforced protection mechanism that separates high-privilege kernel operations from low-privilege user apps.",
              enforcement: "Levels: \nRing 0: Kernel/OS\nRing 1/2: Drivers\nRing 3: Users/Applications.",
              example: "Exam Scenario: A web browser running in Ring 3 crashes. Because of ring isolation, the operating system in Ring 0 remains stable.",
              keyAspect: "Prevents user applications from directly accessing kernel memory."
            },
            { 
              id: "D3-MEM", label: "Memory Protection", type: "concept", 
              definition: "Techniques used by the OS and CPU to prevent processes from accessing memory allocated to other processes.",
              enforcement: "Methods: \n1. ASLR (Randomizes memory addresses)\n2. DEP (Prevents code execution in data areas)\n3. Hardware segmentation.",
              example: "Exam Scenario: An attacker tries to execute shellcode on the stack. DEP blocks the execution because the stack is marked as non-executable.",
              keyAspect: "Critical for preventing buffer overflow and memory injection attacks."
            },
            { 
              id: "D3-TCB", label: "Trusted Computing Base", type: "concept", 
              definition: "The total combination of hardware, firmware, and software elements within a system that are responsible for enforcing the security policy.",
              enforcement: "Goal: Minimization. Smaller TCB is easier to verify and audit.",
              example: "Exam Scenario: An architect removes unnecessary services and drivers from a server to reduce the size of the TCB and improve security.",
              keyAspect: "Smaller TCB = Smaller attack surface. Foundation of system trust."
            },
            { 
              id: "D3-VIRT", label: "Virtualization & Cloud", type: "concept", 
              definition: "Running multiple isolated system instances on shared physical hardware.",
              children: [
                { 
                  id: "D3-HYP", label: "Hypervisors", type: "detail", 
                  definition: "The software/firmware that manages virtual machines. Type 1 runs on bare metal; Type 2 runs on an OS.",
                  enforcement: "Security focus: VM Escape prevention and resource isolation.",
                  example: "Exam Scenario: A data center uses ESXi (Type 1) to host 50 servers on 1 physical host, ensuring that one compromised VM cannot see another's data.",
                  keyAspect: "Isolation is the primary security benefit." 
                },
                { 
                  id: "D3-CLOUD", label: "Cloud Models", type: "detail", 
                  definition: "Deployment models for computing resources. IaaS (Infrastructure), PaaS (Platform), SaaS (Software).",
                  enforcement: "Shared Responsibility Model: Customer vs. Provider duties.",
                  example: "Exam Scenario: In a SaaS model, the provider is responsible for patching the application. In IaaS, the customer must patch the guest OS.",
                  keyAspect: "Understand the 'Shared Responsibility' boundaries for each model." 
                }
              ]
            }
          ]
        },
        {
          id: "D3-PHYS", label: "Physical Security", type: "subdomain",
          definition: "Protecting the physical assets, facilities, and personnel from environmental or human threats.",
          children: [
            { 
              id: "D3-CPTED", label: "CPTED", type: "concept", 
              definition: "Crime Prevention Through Environmental Design. Influencing human behavior through building design.",
              enforcement: "Principles: \n1. Natural Access Control (Walkways/Fences)\n2. Natural Surveillance (Lighting/Sight lines)\n3. Territorial Reinforcement (Signage/Landscaping).",
              example: "Exam Scenario: A company installs low-lying shrubs and bright LED lighting around the parking lot to eliminate hiding spots for intruders.",
              keyAspect: "Deterrence via design. 'Natural' is the keyword."
            },
            { 
              id: "D3-FIRE", label: "Fire Suppression", type: "concept", 
              definition: "Systems designed to detect and extinguish fires to protect lives and hardware.",
              children: [
                { id: "D3-FA", label: "Class A", type: "detail", definition: "Fires involving ordinary combustibles like wood and paper.", enforcement: "Agent: Water, Soda Acid.", keyAspect: "Most common solids." },
                { id: "D3-FB", label: "Class B", type: "detail", definition: "Fires involving flammable liquids like gas, oil, or grease.", enforcement: "Agent: CO2, Halon/Clean Agent, Dry Powder.", keyAspect: "Liquid threats." },
                { id: "D3-FC", label: "Class C", type: "detail", definition: "Fires involving energized electrical equipment.", enforcement: "Agent: Non-conductive (CO2, Halon). NEVER water.", keyAspect: "Electrical - Primary concern for Data Centers." },
                { id: "D3-FK", label: "Class K", type: "detail", definition: "Fires involving cooking oils and fats in commercial kitchens.", enforcement: "Agent: Wet Chemicals.", keyAspect: "Kitchen specific." }
              ],
              keyAspect: "Data Centers use Dry Pipe or Pre-action systems to avoid water damage."
            },
            { 
              id: "D3-PER", label: "Perimeter Security", type: "detail", 
              definition: "The first line of physical defense around a facility.",
              enforcement: "Controls: \n1. Fences (PIDAS)\n2. Bollards (prevent vehicle ramming)\n3. Lighting (minimum 2 foot-candles)\n4. CCTV.",
              example: "Exam Scenario: A high-security facility installs K-rated bollards at the main entrance to stop potential vehicle-borne explosive devices.",
              keyAspect: "Multi-layered: Deter, Detect, Delay, Deny."
            }
          ]
        }
      ]
    },
    { 
      id: "D4", 
      label: "Domain 4: Network Security", 
      type: "domain", 
      color: MM_COLORS.DOMAIN4,
      definition: "Focuses on the protection of communication channels and the design of secure network architectures.",
      keyAspect: "Deep understanding of the OSI Model and Defense in Depth at the network layer.",
      children: [
        {
          id: "D4-MODELS", label: "Network Models", type: "subdomain",
          definition: "Conceptual frameworks for understanding network interactions.",
          children: [
            { 
              id: "D4-OSI", label: "OSI Model (7 Layers)", type: "concept",
              definition: "The Open Systems Interconnection model for network communication.",
              children: [
                { 
                  id: "D4-OSI-L1", label: "L1: Physical", type: "detail", 
                  definition: "The physical layer consists of the basic hardware of the network, including cables, connectors, and signals.",
                  enforcement: "Mechanisms: Cables (CAT6, Fiber), Hubs, Repeaters, Modulation.",
                  example: "Exam Scenario: An attacker physically taps a fiber optic cable using an optical splitter to intercept signals. This occurs at Layer 1.",
                  keyAspect: "Data as electrical/optical signals. Focus: Physical transmission." 
                },
                { 
                  id: "D4-OSI-L2", label: "L2: Data Link", type: "detail", 
                  definition: "Responsible for hop-to-hop data transfer, framing, and MAC addressing.",
                  enforcement: "Mechanisms: MAC addresses, ARP, Bridges, Switches, VLANs.",
                  example: "Exam Scenario: An attacker performs ARP poisoning to associate their MAC address with the gateway's IP address. This is a Layer 2 attack.",
                  keyAspect: "Data units: Frames. Key control: MAC Filtering and VLANs." 
                },
                { 
                  id: "D4-OSI-L3", label: "L3: Network", type: "detail", 
                  definition: "Responsible for logical addressing and routing packets across multiple networks.",
                  enforcement: "Mechanisms: IP Addresses (IPv4/v6), ICMP, Routers, IPsec.",
                  example: "Exam Scenario: A router chooses the best path for a packet based on a routing table. If it receives a malformed IP header, it drops the packet at Layer 3.",
                  keyAspect: "Data units: Packets. Key control: Routing protocols and IPsec." 
                },
                { 
                  id: "D4-OSI-L4", label: "L4: Transport", type: "detail", 
                  definition: "Responsible for end-to-end communication, flow control, and error correction.",
                  enforcement: "Mechanisms: TCP (Connection-oriented), UDP (Connectionless), SSL/TLS (Handshake).",
                  example: "Exam Scenario: A firewall inspects TCP sequence numbers to prevent session hijacking. This stateful inspection happens at Layer 4.",
                  keyAspect: "Data units: Segments (TCP) / Datagrams (UDP). Focus: Reliability." 
                },
                { 
                  id: "D4-OSI-L5", label: "L5: Session", type: "detail", 
                  definition: "Manages the setup, maintenance, and teardown of communication sessions between applications.",
                  enforcement: "Mechanisms: RPC, SQL, NFS, Simplex/Duplex management.",
                  example: "Exam Scenario: A user loses connection to a database. The session layer protocol attempts to re-establish the link without losing application data.",
                  keyAspect: "Focus: Dialog control and session management." 
                },
                { 
                  id: "D4-OSI-L6", label: "L6: Presentation", type: "detail", 
                  definition: "Responsible for data translation, encryption, and compression, ensuring the application can understand the data.",
                  enforcement: "Mechanisms: ASCII, JPEG, MPEG, SSL/TLS (Encryption).",
                  example: "Exam Scenario: A browser and server negotiate the use of AES-256 for data encryption. This formatting choice is a Layer 6 function.",
                  keyAspect: "Focus: 'Common Syntax' and Encryption." 
                },
                { 
                  id: "D4-OSI-L7", label: "L7: Application", type: "detail", 
                  definition: "The interface between the user and the network services.",
                  enforcement: "Mechanisms: HTTP, FTP, SMTP, DNS, SSH, Telnet.",
                  example: "Exam Scenario: An attacker uses SQL injection against a web form. Although it targets a DB, the initial interface is at Layer 7.",
                  keyAspect: "Focus: Network services and user interfaces." 
                }
              ]
            },
            {
              id: "D4-TCP", label: "TCP/IP Model (4 Layers)", type: "concept",
              definition: "The practical implementation of networking used in the modern Internet.",
              children: [
                { 
                  id: "D4-TCP-APP", label: "Application", type: "detail", 
                  definition: "Combines the functions of OSI Layers 5, 6, and 7.",
                  enforcement: "Protocols: HTTP, SMTP, DNS, SSH.",
                  example: "Exam Scenario: When using SSH to manage a server, you are interacting with the Application layer of the TCP/IP stack.",
                  keyAspect: "Covers all session, presentation, and application logic." 
                },
                { 
                  id: "D4-TCP-TRA", label: "Transport", type: "detail", 
                  definition: "Equivalent to OSI Layer 4. Manages end-to-end data delivery.",
                  enforcement: "Protocols: TCP, UDP.",
                  example: "Exam Scenario: Ensuring that a large file is reassembled correctly using sequence numbers occurs here.",
                  keyAspect: "Focus: Port numbers and reliability." 
                },
                { 
                  id: "D4-TCP-INT", label: "Internet", type: "detail", 
                  definition: "Equivalent to OSI Layer 3. Handles packet routing and addressing.",
                  enforcement: "Protocols: IP, ICMP, IGMP.",
                  example: "Exam Scenario: Using 'ping' sends an ICMP Echo Request, which is processed at this layer.",
                  keyAspect: "Focus: IP Addressing and Routing." 
                },
                { 
                  id: "D4-TCP-LINK", label: "Link (Network Access)", type: "detail", 
                  definition: "Combines OSI Layers 1 and 2. Interacts with the physical hardware.",
                  enforcement: "Protocols: Ethernet, Wi-Fi (802.11), ARP.",
                  example: "Exam Scenario: Converting IP packets into Ethernet frames for local delivery on a LAN.",
                  keyAspect: "Focus: Physical media and local hardware addressing." 
                }
              ]
            }
          ]
        },
        {
          id: "D4-INFRA", label: "Network Infrastructure", type: "subdomain",
          definition: "The physical and logical components that form a network.",
          children: [
            { 
              id: "D4-HARD", label: "Network Hardware", type: "concept",
              children: [
                { 
                  id: "D4-H-SW", label: "Switches", type: "detail", 
                  definition: "A Layer 2 device that uses MAC addresses to forward data only to the intended recipient on a local network.",
                  enforcement: "Controls: Port Security, VLANs, 802.1X, Spanning Tree Protocol (STP).",
                  example: "Exam Scenario: To prevent unauthorized devices from connecting to the wall jacks, an admin enables Port Security to limit MAC addresses.",
                  keyAspect: "VLANs provide logical segmentation. Layer 2 focus." 
                },
                { 
                  id: "D4-H-RT", label: "Routers", type: "detail", 
                  definition: "A Layer 3 device that interconnects different networks and uses IP addresses to determine the best path for data.",
                  enforcement: "Controls: Access Control Lists (ACLs), BGP, OSPF, NAT.",
                  example: "Exam Scenario: A router's ACL is configured to block all incoming traffic from a known malicious IP range.",
                  keyAspect: "Interconnects different broadcast domains. Layer 3 focus." 
                },
                { 
                  id: "D4-H-FW", label: "Firewalls", type: "detail", 
                  definition: "Security appliances that filter incoming and outgoing traffic based on a defined security policy.",
                  enforcement: "Types: Packet Filtering (L3), Stateful Inspection (L4), Proxy/Application (L7), Next-Gen (L7 + IPS).",
                  example: "Exam Scenario: A 'Stateful Inspection' firewall tracks the state of active connections and automatically allows return traffic for established sessions.",
                  keyAspect: "Implicit Deny is the primary security principle for firewalls." 
                }
              ]
            },
            {
              id: "D4-PROTO", label: "Secure Protocols", type: "concept",
              children: [
                { 
                  id: "D4-P-TLS", label: "TLS (1.2 / 1.3)", type: "detail", 
                  definition: "A cryptographic protocol designed to provide communication security over a computer network (successor to SSL).",
                  enforcement: "Steps: 1. Handshake (Asymmetric) 2. Session Key Exchange 3. Bulk Transfer (Symmetric).",
                  example: "Exam Scenario: A bank uses TLS 1.3 to ensure that customer login credentials are encrypted and the server's identity is verified.",
                  keyAspect: "TLS 1.3 is more secure/faster as it removes weak ciphers and shortens the handshake." 
                },
                { 
                  id: "D4-P-IPSEC", label: "IPsec", type: "detail", 
                  definition: "A suite of protocols for securing Internet Protocol (IP) communications by authenticating and encrypting each IP packet.",
                  enforcement: "Modes: Transport (Payload only) vs Tunnel (Entire packet). Components: AH (Auth) and ESP (Encryption).",
                  example: "Exam Scenario: Two corporate offices use an IPsec VPN in Tunnel Mode to safely communicate over the public internet.",
                  keyAspect: "ESP provides Confidentiality; AH does NOT." 
                },
                { 
                  id: "D4-P-SSH", label: "SSH (Port 22)", type: "detail", 
                  definition: "A secure protocol for remote login and other secure network services over an insecure network.",
                  enforcement: "Controls: RSA/ECC keys for auth, AES for encryption.",
                  example: "Exam Scenario: An admin uses SSH instead of Telnet to configure a router to prevent their password from being sniffed in clear-text.",
                  keyAspect: "Standard replacement for Telnet, RLOGIN, and FTP (SFTP)." 
                }
              ]
            }
          ]
        },
        {
          id: "D4-WIRE", label: "Wireless Security", type: "subdomain",
          definition: "Protecting radio-based network communications.",
          children: [
            { 
              id: "D4-W-WPA2", label: "WPA2", type: "detail", 
              definition: "A wireless security standard that uses AES encryption and CCMP for data protection.",
              enforcement: "Mechanism: 4-Way Handshake. Vulnerability: KRACK attack (Key Reinstallation).",
              example: "Exam Scenario: An organization uses WPA2-Enterprise with RADIUS to ensure each user logs in with their own unique credentials.",
              keyAspect: "Strongest widely-deployed standard until WPA3. Replaced TKIP/WEP." 
            },
            { 
              id: "D4-W-WPA3", label: "WPA3", type: "detail", 
              definition: "The latest wireless security standard, providing enhanced protection against offline dictionary attacks.",
              enforcement: "Mechanism: SAE (Simultaneous Authentication of Equals) replaces PSK.",
              example: "Exam Scenario: A high-security site deploys WPA3 to protect against brute-force password guessing even if the attacker captures the handshake.",
              keyAspect: "SAE provides Forward Secrecy." 
            },
            { 
              id: "D4-W-EAP", label: "EAP (802.1X)", type: "detail", 
              definition: "An authentication framework used in wireless networks and Point-to-Point connections.",
              enforcement: "Types: EAP-TLS (Certificates - Strongest), PEAP (Password inside TLS tunnel).",
              example: "Exam Scenario: A company requires EAP-TLS, meaning every laptop must have a unique digital certificate to join the Wi-Fi.",
              keyAspect: "802.1X provides port-based network access control (PNAC)." 
            }
          ]
        },
        {
          id: "D4-ATTACK", label: "Network Attacks", type: "subdomain",
          definition: "Threats targeting network availability and confidentiality.",
          children: [
            { 
              id: "D4-A-DDOS", label: "DDoS", type: "detail", 
              definition: "A distributed denial-of-service attack attempts to make a server unavailable by overwhelming it with traffic from multiple sources.",
              enforcement: "Controls: Throttling, Load Balancing, Sinkholing, WAF, Cloud-based scrubbers.",
              example: "Exam Scenario: An e-commerce site is flooded with millions of SYN packets during Black Friday, causing the web server to crash.",
              keyAspect: "Goal: Violate Availability. Primary defense is redundancy and traffic analysis." 
            },
            { 
              id: "D4-A-MITM", label: "Man-in-the-Middle", type: "detail", 
              definition: "An attack where the attacker secretly relays and possibly alters communications between two parties who believe they are directly communicating.",
              enforcement: "Controls: Mutual Authentication, Digital Signatures, TLS with certificate pinning.",
              example: "Exam Scenario: An attacker at a coffee shop sets up a 'Rogue AP' to intercept traffic from users who connect to it thinking it's the free Wi-Fi.",
              keyAspect: "Violates: Confidentiality and Integrity." 
            },
            { 
              id: "D4-A-SPOOF", label: "Spoofing", type: "detail", 
              definition: "An attack in which a person or program successfully masquerades as another by falsifying data, such as an IP address or MAC address.",
              enforcement: "Controls: Ingress/Egress filtering, IP Source Guard, DAI (Dynamic ARP Inspection).",
              example: "Exam Scenario: An attacker sends packets with a forged source IP address to bypass a firewall that only allows traffic from a specific server.",
              keyAspect: "Often a precursor to other attacks like DDoS or MITM." 
            }
          ]
        }
      ]
    },
    { 
      id: "D5", 
      label: "Domain 5: Identity & Access", 
      type: "domain", 
      color: MM_COLORS.DOMAIN5,
      definition: "Focuses on controlling and monitoring access to assets using robust identification, authentication, authorization, and accountability frameworks.",
      keyAspect: "Identity is the new perimeter in modern hybrid environments.",
      children: [
        {
          id: "D5-IAAA", label: "The IAAA Framework", type: "subdomain",
          definition: "The core four-step process of access control.",
          children: [
            { 
              id: "D5-IDENT", label: "Identification", type: "detail", 
              definition: "The process where a subject (user or process) claims an identity to a system. It is the necessary first step in any access control system.",
              enforcement: "Controls: Unique usernames, smart card UIDs, MAC addresses, employee IDs, process PIDs.",
              example: "Exam Scenario: A user types 'jdoe123' into a login box. At this stage, the system only knows who the user 'claims' to be, not if it is actually them.",
              keyAspect: "Identification must be unique to ensure accountability." 
            },
            { 
              id: "D5-AUTHEN", label: "Authentication", type: "detail", 
              definition: "The process of verifying the claimed identity by checking one or more factors provided by the subject.",
              enforcement: "Factors: Type 1 (Knowledge), Type 2 (Possession), Type 3 (Inherence/Biometric).",
              example: "Exam Scenario: After providing a username, a user enters a complex passphrase and a one-time code from their phone app.",
              keyAspect: "Requires at least one factor of evidence to prove identity." 
            },
            { 
              id: "D5-AUTHOR", label: "Authorization", type: "detail", 
              definition: "The process of granting or denying access to specific resources based on the authenticated subject's permissions.",
              enforcement: "Mechanisms: ACLs, RBAC policies, capability tables, file system permissions (R/W/X).",
              example: "Exam Scenario: A user is logged in but cannot access the 'Finance' folder because their role is 'Marketing' and they lack the required NTFS permissions.",
              keyAspect: "Enforces the principle of 'Need-to-Know' and 'Least Privilege'." 
            },
            { 
              id: "D5-ACCOUNT", label: "Accountability", type: "detail", 
              definition: "Ensuring that all actions taken on a system can be traced back to a specific unique identity. It supports non-repudiation.",
              enforcement: "Mechanisms: Detailed audit logs, SIEM analysis, session recordings, digital signatures.",
              example: "Exam Scenario: A security auditor uses system logs to prove that Admin account 'B-Smith' modified the firewall rules at 3:00 AM.",
              keyAspect: "Relies on unique identification and secure logging of events." 
            }
          ]
        },
        {
          id: "D5-FACTORS", label: "Authentication Factors", type: "subdomain",
          definition: "The three standard types of credentials.",
          children: [
            { 
              id: "D5-TYPE1", label: "Type 1: Knowledge", type: "detail", 
              definition: "Information that the subject knows. It is the most commonly used but also the most easily shared or stolen factor.",
              enforcement: "Controls: Passwords, PINs, passphrases, challenge-response security questions.",
              example: "Exam Scenario: A system requires a 6-digit numeric PIN to unlock a mobile device.",
              keyAspect: "Vulnerable to guessing, brute-force, and social engineering." 
            },
            { 
              id: "D5-TYPE2", label: "Type 2: Possession", type: "detail", 
              definition: "A physical or logical object that the subject has in their possession.",
              enforcement: "Controls: Smart cards, hardware tokens (RSA SecurID), SMS/email codes, TOTP authenticator apps.",
              example: "Exam Scenario: A federal employee must insert their PIV (Personal Identity Verification) card into a laptop to begin the login process.",
              keyAspect: "Vulnerable to physical theft or cloning." 
            },
            { 
              id: "D5-TYPE3", label: "Type 3: Inherence", type: "detail", 
              definition: "Biological or behavioral characteristics of the subject (Biometrics).", 
              children: [
                { 
                  id: "D5-BIO-E", label: "Biometric Errors", type: "detail", 
                  definition: "Mathematical measurement of biometric system accuracy. Goal is to balance security and usability.", 
                  enforcement: "Type I (FRR - False Rejection), Type II (FAR - False Acceptance), CER (Crossover Error Rate).", 
                  example: "Exam Scenario: An iris scanner allows an unauthorized twin into a high-security vault. This is a Type II (False Acceptance) error.",
                  keyAspect: "CER/EER is where FRR equals FAR; a lower CER indicates a more accurate system." 
                }
              ],
              keyAspect: "Most difficult to spoof but raises significant privacy concerns." 
            },
            { 
              id: "D5-MFA", label: "MFA / 2FA", type: "detail", 
              definition: "The use of two or more different categories of authentication factors. Using two different passwords is NOT MFA.",
              enforcement: "Requirement: Factor Category 1 + Category 2 (e.g., Password + Fingerprint).",
              example: "Exam Scenario: A user must provide a password (Type 1) and a code generated by a hardware token (Type 2).",
              keyAspect: "Significantly increases the difficulty of account compromise." 
            }
          ]
        },
        {
          id: "D5-MODELS", label: "Access Control Models", type: "subdomain",
          definition: "Philosophical and mathematical frameworks for managing permissions.",
          children: [
            { 
              id: "D5-DAC", label: "DAC (Discretionary)", type: "detail", 
              definition: "Access control where the owner of a resource has full discretion over who can access it.", 
              enforcement: "Mechanisms: NTFS permissions, Unix file modes, ACLs set by users.",
              example: "Exam Scenario: A team leader creates a folder on a shared drive and grants 'Read-Only' access to the rest of the team.",
              keyAspect: "Highly flexible but decentralizes security management." 
            },
            { 
              id: "D5-MAC", label: "MAC (Mandatory)", type: "detail", 
              definition: "System-enforced access based on subject clearance and object sensitivity labels. Users cannot change access.", 
              enforcement: "Mechanisms: Security labels (Top Secret, Secret, etc.), lattice models, rule-based policies.",
              example: "Exam Scenario: A user with 'Secret' clearance is prevented by the OS from opening a 'Top Secret' file, regardless of file ownership.",
              keyAspect: "Used in military/high-security environments where the system enforces the policy." 
            },
            { 
              id: "D5-RBAC", label: "RBAC (Role-Based)", type: "detail", 
              definition: "Access is granted based on the subject's organizational role rather than individual identity.", 
              enforcement: "Mechanisms: Role groups, permission-to-role mappings, user-to-role assignments.",
              example: "Exam Scenario: All employees in the 'Nurse' role can view patient charts, but only those in the 'Doctor' role can prescribe medications.",
              keyAspect: "Simplifies management in large organizations and facilitates 'Least Privilege'." 
            },
            { 
              id: "D5-ABAC", label: "ABAC (Attribute-Based)", type: "detail", 
              definition: "A dynamic model that evaluates attributes of the subject, object, and environment against a policy.", 
              enforcement: "Mechanisms: Attributes (IP address, time of day, location), XACML policies.",
              example: "Exam Scenario: A policy allows access to the database only during business hours (9-5) from a managed company device located in the USA.",
              keyAspect: "Most granular and flexible access control model (Policy-Based)." 
            }
          ]
        },
        {
          id: "D5-TECH", label: "Identity Protocols", type: "subdomain",
          definition: "Technical standards for implementing IAM systems.",
          children: [
            { 
              id: "D5-KERB", label: "Kerberos", type: "concept", 
              definition: "A network authentication protocol that uses 'tickets' and symmetric-key cryptography to provide SSO in trusted networks.",
              children: [
                { 
                  id: "D5-KDC", label: "KDC", type: "detail", 
                  definition: "Key Distribution Center. The central trusted authority that manages authentication (AS) and ticket issuance (TGS).", 
                  enforcement: "Encryption: Symmetric keys (AES/DES), principal database.",
                  example: "Exam Scenario: A workstation sends a request to the KDC's Authentication Service to obtain a Ticket Granting Ticket (TGT).",
                  keyAspect: "Single point of failure and depends on tight time sync (NTP)." 
                },
                { 
                  id: "D5-TICKET", label: "Tickets", type: "detail", 
                  definition: "Cryptographic data blobs used to prove identity and request access to specific services without resending passwords.", 
                  enforcement: "Components: TGT (Ticket Granting Ticket), Service Tickets, session keys, timestamps.",
                  example: "Exam Scenario: A user presents a valid TGT to the TGS to receive a Service Ticket for a networked printer.",
                  keyAspect: "Protects against replay attacks using encrypted timestamps." 
                }
              ]
            },
            { 
              id: "D5-FED", label: "Federated Identity", type: "concept", 
              definition: "Standardized protocols for sharing identity and authentication data across independent domains or organizations.",
              children: [
                { 
                  id: "D5-SAML", label: "SAML", type: "detail", 
                  definition: "Security Assertion Markup Language. An XML-based standard for exchanging authentication/authorization data.", 
                  enforcement: "Mechanisms: Assertions, digital signatures, IdP (Identity Provider), SP (Service Provider).",
                  example: "Exam Scenario: A user logs into their company portal and is automatically signed into a third-party payroll site (ADP) via a SAML redirect.",
                  keyAspect: "Primarily used for web-based Single Sign-On (SSO)." 
                },
                { 
                  id: "D5-OAUTH", label: "OAuth 2.0 / OIDC", type: "detail", 
                  definition: "OAuth 2.0 is for Authorization (delegated access). OIDC is an identity layer on top of OAuth for Authentication.", 
                  enforcement: "Mechanisms: Access tokens, Refresh tokens, Scopes, JSON Web Tokens (JWT).",
                  example: "Exam Scenario: A user signs into a mobile app using their Google account. The app receives a JWT containing identity info via OIDC.",
                  keyAspect: "Modern standard for API security and mobile application identity." 
                }
              ]
            }
          ]
        },
        {
          id: "D5-LIFECYCLE", label: "Identity Lifecycle", type: "subdomain",
          definition: "Managing an identity from creation to retirement.",
          children: [
            { 
              id: "D5-PROV", label: "Provisioning", type: "detail", 
              definition: "The process of creating accounts, assigning initial rights, and allocating resources for a new subject.", 
              enforcement: "Mechanisms: Automated HR-to-AD synchronization, self-service portals.",
              example: "Exam Scenario: When a new employee is hired, the HR system triggers a script that automatically creates their email and network account.",
              keyAspect: "Should follow the principle of Least Privilege from day one." 
            },
            { 
              id: "D5-REV", label: "Review / Attestation", type: "detail", 
              definition: "The periodic verification that a user's access rights are still appropriate for their current job function.", 
              enforcement: "Mechanisms: User Access Reviews (UAR), manager certification workflows.",
              example: "Exam Scenario: Every quarter, the Finance Manager must review a report of their employees' database permissions and sign off on their validity.",
              keyAspect: "Critical for preventing 'Privilege Creep'." 
            },
            { 
              id: "D5-REVOC", label: "Revocation", type: "detail", 
              definition: "The immediate removal of access rights and account termination when they are no longer needed.", 
              enforcement: "Mechanisms: Account disabling, clearing active session tokens, certificate revocation (CRL).",
              example: "Exam Scenario: An employee is terminated. HR immediately notifies IT, who disables the Active Directory account to prevent unauthorized access.",
              keyAspect: "Essential for mitigating the risk of disgruntled former employees." 
            }
          ]
        }
      ]
    },
    { 
      id: "D6", 
      label: "Domain 6: Security Assessment", 
      type: "domain", 
      color: MM_COLORS.DOMAIN6,
      definition: "Focuses on the design, implementation, and analysis of security testing to verify that controls are operating effectively.",
      keyAspect: "Assessments provide the proof (evidence) that management's security controls actually work.",
      children: [
        {
          id: "D6-STRAT", label: "Assessment Strategies", type: "subdomain",
          definition: "How an organization plans its testing and audit activities.",
          children: [
            { 
              id: "D6-INT-EXT", label: "Internal vs External", type: "detail",
              definition: "Internal assessments are conducted by the organization's own staff (e.g., internal audit team), while external assessments are conducted by an independent third party.",
              enforcement: "Controls: Auditor independence, conflict of interest reviews, peer reviews.",
              example: "Exam Scenario: A bank uses its own IT team for monthly vulnerability scans (Internal) but hires a certified CPA firm to conduct its annual SOC 2 audit (External).",
              keyAspect: "Independence is key for external audits; internal audits are often used for continuous improvement."
            },
            { 
              id: "D6-3RD", label: "Third-party Assessments", type: "detail",
              definition: "Engaging outside firms to verify security posture, often required for compliance with regulations like PCI-DSS or SOC.",
              enforcement: "Steps: 1. Define SOW (Scope of Work). 2. Sign NDA (Non-Disclosure Agreement). 3. Agree on RoE (Rules of Engagement).",
              example: "Exam Scenario: An e-commerce company must hire a Qualified Security Assessor (QSA) to perform an annual on-site audit for PCI-DSS compliance.",
              keyAspect: "Third-party reports provide 'Assurance' to partners and regulators."
            }
          ]
        },
        {
          id: "D6-TESTS", label: "Security Control Testing", type: "subdomain",
          definition: "Technical methods used to identify vulnerabilities and test the effectiveness of security controls.",
          children: [
            { 
              id: "D6-VA", label: "Vulnerability Assessment", type: "detail",
              definition: "Automated scanning of systems and networks to identify known security weaknesses (CVEs) without attempting to exploit them.",
              enforcement: "Steps: 1. Identification (Scanning). 2. Classification (Ranking). 3. Prioritization (Remediation plan).",
              example: "Exam Scenario: An admin runs an automated scan using Nessus and discovers three servers missing critical MS17-010 (EternalBlue) patches.",
              keyAspect: "Detective control. Provides a 'snapshot' of flaws but does not prove they can be exploited."
            },
            { 
              id: "D6-PT", label: "Penetration Testing", type: "concept",
              definition: "Simulated cyberattacks intended to exploit vulnerabilities and test the organization's detection and response capabilities.",
              children: [
                { 
                  id: "D6-PT-BLACK", label: "Black Box", type: "detail", 
                  definition: "The tester has zero prior knowledge of the target system's architecture, code, or internal workings.", 
                  enforcement: "Method: Heavy focus on Reconnaissance and Open Source Intelligence (OSINT).",
                  example: "Exam Scenario: A pentester is given only the company's URL and told to find a way to access internal employee HR records.",
                  keyAspect: "Simulates an external, unprivileged attacker." 
                },
                { 
                  id: "D6-PT-GREY", label: "Grey Box", type: "detail", 
                  definition: "The tester has partial knowledge of the target (e.g., architectural diagrams or a standard user account).", 
                  enforcement: "Method: Balances efficiency with realism by skipping some reconnaissance.",
                  example: "Exam Scenario: A pentester is provided with a low-level 'Guest' login and tries to perform lateral movement or privilege escalation.",
                  keyAspect: "Simulates an insider with limited access or a persistent attacker who has gained a foothold." 
                },
                { 
                  id: "D6-PT-WHITE", label: "White Box", type: "detail", 
                  definition: "The tester has full access to source code, network diagrams, and administrative credentials.", 
                  enforcement: "Method: In-depth code review, configuration auditing, and logic testing.",
                  example: "Exam Scenario: A security firm is given the source code of a new crypto-trading application to find logic flaws that automated tools might miss.",
                  keyAspect: "Most comprehensive and efficient, but least realistic simulation of an outside attack." 
                }
              ],
              keyAspect: "Phases: Planning -> Recon -> Scanning -> Exploitation -> Post-Exploitation -> Reporting."
            },
            {
              id: "D6-CODE", label: "Software Testing", type: "concept",
              children: [
                { 
                  id: "D6-SAST", label: "Static (SAST)", type: "detail", 
                  definition: "Analyzing application source code or binaries without executing the program.", 
                  enforcement: "Controls: IDE plugins, linting tools, secure coding standards (OWASP).",
                  example: "Exam Scenario: A developer uses a tool to scan their Java code for hardcoded passwords and SQL injection flaws before pushing to production.",
                  keyAspect: "White-box testing. Finds flaws early in the SDLC (Shift Left)." 
                },
                { 
                  id: "D6-DAST", label: "Dynamic (DAST)", type: "detail", 
                  definition: "Testing the application in its running state from the outside by sending malformed inputs.", 
                  enforcement: "Controls: Web proxies, fuzzers, automated scanners.",
                  example: "Exam Scenario: A security team uses an automated tool to 'crawl' the live staging website and test every form for Cross-Site Scripting (XSS).",
                  keyAspect: "Black-box testing. Finds runtime vulnerabilities and configuration issues." 
                }
              ]
            }
          ]
        },
        {
          id: "D6-DATA", label: "Security Process Data", type: "subdomain",
          definition: "Collecting and analyzing evidence of security activities to ensure accountability and effectiveness.",
          children: [
            { 
              id: "D6-LOGS", label: "Log Management", type: "detail",
              definition: "The process of collecting, aggregating, storing, and analyzing logs from systems, applications, and security devices.",
              enforcement: "Controls: SIEM (Security Information and Event Management), NTP (Time Sync), WORM storage (Log Integrity).",
              example: "Exam Scenario: After a breach, an investigator discovers that the logs are useless because the web server's clock was 2 hours ahead of the database server's clock.",
              keyAspect: "NTP synchronization is critical for event correlation during forensics."
            },
            { 
              id: "D6-ACCOUNT", label: "Account Reviews", type: "detail",
              definition: "The periodic auditing of user access rights to ensure that the principle of Least Privilege is maintained.",
              enforcement: "Steps: 1. Generate access report. 2. Manager attestation. 3. Immediate revocation of unnecessary rights.",
              example: "Exam Scenario: A quarterly access review reveals that a transferred marketing employee still has 'Admin' access to the Production Database.",
              keyAspect: "Primary control for detecting and preventing 'Privilege Creep'."
            },
            {
              id: "D6-TRAIN", label: "Training & Exercises", type: "detail",
              definition: "Testing the 'Human' element of security through education and simulated crisis events.",
              enforcement: "Controls: Phishing simulations, Tabletop exercises, Red Team/Blue Team drills.",
              example: "Exam Scenario: A security manager runs a 'Tabletop Exercise' where the C-suite walks through their roles during a hypothetical ransomware attack.",
              keyAspect: "Tabletops test the 'Plan' (Policy/Process), not the 'Hardware'."
            }
          ]
        },
        {
          id: "D6-AUDIT", label: "Auditing Standards", type: "subdomain",
          definition: "Formal frameworks for reporting audit results to stakeholders.",
          children: [
            { 
              id: "D6-SOC", label: "SOC Reports (SSAE 18)", type: "concept",
              children: [
                { 
                  id: "D6-SOC1", label: "SOC 1", type: "detail", 
                  definition: "Audits focusing specifically on controls relevant to the user organization's internal control over financial reporting (ICFR).", 
                  enforcement: "Standard: SSAE 18.",
                  example: "Exam Scenario: A payroll service provider provides a SOC 1 to its clients' CPAs to support their financial audits.",
                  keyAspect: "Not primarily a security report; focused on money/finance." 
                },
                { 
                  id: "D6-SOC2", label: "SOC 2", type: "detail", 
                  definition: "Audits based on the Trust Services Criteria (TSC): Security, Availability, Processing Integrity, Confidentiality, and Privacy.", 
                  enforcement: "Access: Restricted. Provided only to management, regulators, and partners under NDA.",
                  example: "Exam Scenario: A SaaS company shares its SOC 2 report with a potential enterprise client to prove they have a robust security program.",
                  keyAspect: "The most important audit report for security professionals." 
                },
                { 
                  id: "D6-SOC3", label: "SOC 3", type: "detail", 
                  definition: "A summary version of the SOC 2 report intended for general public release.", 
                  enforcement: "Seal: Often displayed as a 'SysTrust' or 'WebTrust' seal on a company's website.",
                  example: "Exam Scenario: A cloud provider puts a SOC 3 seal on its marketing homepage to build trust with anonymous visitors.",
                  keyAspect: "Publicly available; contains no confidential details of controls." 
                }
              ]
            },
            { 
              id: "D6-TYPE", label: "Report Types", type: "concept",
              children: [
                { 
                  id: "D6-TYPE1", label: "Type I", type: "detail", 
                  definition: "A report on management's description of a service organization's system and the suitability of the design of controls at a specific point in time.", 
                  enforcement: "Snapshot: Describes controls that 'should' be there.",
                  example: "Exam Scenario: An auditor verifies that a company has a firewall policy in place on January 1st.",
                  keyAspect: "Verifies control 'Design' at a single point in time." 
                },
                { 
                  id: "D6-TYPE2", label: "Type II", type: "detail", 
                  definition: "A report that includes the auditor's opinion on the operating effectiveness of the controls over a specific period (usually 6-12 months).", 
                  enforcement: "Evidence: Requires sampling logs and records over the entire period.",
                  example: "Exam Scenario: An auditor verifies that the company's firewall actually blocked unauthorized traffic every day from January to June.",
                  keyAspect: "Verifies control 'Operational Effectiveness' over a period of time. Much higher assurance than Type I." 
                }
              ]
            }
          ]
        }
      ]
    },
    { 
      id: "D7", 
      label: "Domain 7: Security Operations", 
      type: "domain", 
      color: MM_COLORS.DOMAIN7,
      definition: "Focuses on the day-to-day security operations, investigations, and incident response required to maintain the availability, integrity, and confidentiality of the organization.",
      keyAspect: "Continuous monitoring and rapid response are the lifeblood of security operations.",
      children: [
        {
          id: "D7-INVEST", label: "Investigations", type: "subdomain",
          definition: "Formal processes for uncovering facts and gathering evidence regarding potential security breaches or crimes.",
          children: [
            { 
              id: "D7-INV-TYPES", label: "Investigation Types", type: "concept",
              children: [
                { 
                  id: "D7-INV-ADM", label: "Administrative", type: "detail", 
                  definition: "Internal investigations into policy violations or standard operating procedures within the organization.", 
                  enforcement: "Steps: 1. Interview stakeholders. 2. Review logs. 3. Report to HR/Management.",
                  example: "Exam Scenario: An employee is suspected of using their workstation to browse prohibited content. The security team conducts an administrative investigation to verify policy non-compliance.",
                  keyAspect: "Focus: Employee discipline and internal accountability." 
                },
                { 
                  id: "D7-INV-CRIM", label: "Criminal", type: "detail", 
                  definition: "Investigations into statutory violations where laws have been broken. Conducted in conjunction with law enforcement.", 
                  enforcement: "Steps: 1. Preserve scene. 2. Contact authorities. 3. Assist in legal discovery.",
                  example: "Exam Scenario: An external hacker breaches a government database to steal sensitive identities. This triggers a criminal investigation led by federal agencies.",
                  keyAspect: "Burden of proof: Beyond a reasonable doubt." 
                },
                { 
                  id: "D7-INV-CIV", label: "Civil", type: "detail", 
                  definition: "Investigations into disputes between private parties, often involving contract breaches or intellectual property theft.", 
                  enforcement: "Steps: 1. Discovery process. 2. Legal hold. 3. Expert testimony.",
                  example: "Exam Scenario: Company A sues Company B for 'patent infringement' and requests access to email archives for the discovery phase.",
                  keyAspect: "Burden of proof: Preponderance of the evidence." 
                }
              ]
            },
            { 
              id: "D7-EVIDENCE", label: "Evidence Handling", type: "concept",
              definition: "The procedures for identifying, collecting, and preserving data for legal proceedings.",
              children: [
                { 
                  id: "D7-EV-BEST", label: "Best Evidence", type: "detail", 
                  definition: "The original document or physical object rather than a copy. In digital forensics, this often refers to the original drive or a bit-by-bit image with a verified hash.", 
                  enforcement: "Controls: Hashing (SHA-256), Write-blockers, physical tagging.",
                  example: "Exam Scenario: A prosecutor presents the original physical hard drive in court to ensure the defense cannot claim the data was modified during the copying process.",
                  keyAspect: "Most reliable; secondary evidence is only admitted if best evidence is destroyed or unavailable." 
                },
                { 
                  id: "D7-EV-CHAIN", label: "Chain of Custody", type: "detail", 
                  definition: "A documented, chronological history of who had possession of the evidence from the moment it was collected until it reached the courtroom.", 
                  enforcement: "Steps: 1. Log entry at collection. 2. Signature on transfer. 3. Secure storage access logs.",
                  example: "Exam Scenario: A critical log file is ruled inadmissible in court because the security team cannot provide a signature for the 4-hour window it sat on a desk.",
                  keyAspect: "Ensures evidence integrity and prevents tampering claims." 
                }
              ]
            }
          ]
        },
        {
          id: "D7-INCIDENT", label: "Incident Management", type: "subdomain",
          definition: "A structured approach to responding to and managing the aftermath of a security breach or cyberattack.",
          children: [
            { 
              id: "D7-IR-PHASES", label: "IR Lifecycle (NIST)", type: "concept",
              children: [
                { 
                  id: "D7-IR-PREP", label: "Preparation", type: "detail", 
                  definition: "Building the capabilities to respond to incidents, including policies, team creation, and tool acquisition.", 
                  enforcement: "Controls: IR Plan, communication channels, 'Jump Bags', training.",
                  example: "Exam Scenario: An IR team discovers they cannot disconnect a rogue server because the 'Preparation' phase failed to grant them administrative rights to the hypervisor.",
                  keyAspect: "The only phase that happens BEFORE the incident." 
                },
                { 
                  id: "D7-IR-DET", label: "Detection & Analysis", type: "detail", 
                  definition: "The act of identifying that a security event is occurring and determining its scope and impact.", 
                  enforcement: "Steps: 1. Monitor SIEM. 2. Triage events. 3. Validate incident vs false positive.",
                  example: "Exam Scenario: A sudden spike in database egress traffic alerts the SOC to a potential data exfiltration event.",
                  keyAspect: "Focus: Minimizing false positives and establishing a baseline." 
                },
                { 
                  id: "D7-IR-CON", label: "Containment & Eradication", type: "detail", 
                  definition: "Stopping the incident from spreading (Containment) and removing the threat from the environment (Eradication).", 
                  enforcement: "Steps: 1. Isolate VLAN. 2. Wipe infected host. 3. Remove malicious accounts.",
                  example: "Exam Scenario: To stop ransomware from moving laterally, the IR team disables the SMB service across the entire network branch.",
                  keyAspect: "Balance between 'Stop the Bleeding' and 'Keep the Business Running'." 
                },
                { 
                  id: "D7-IR-REC", label: "Recovery", type: "detail", 
                  definition: "Restoring systems to their normal operational state while ensuring that the vulnerability that caused the breach is fixed.", 
                  enforcement: "Steps: 1. Restore from clean backup. 2. Patch system. 3. Monitor for reinfection.",
                  example: "Exam Scenario: After cleaning a malware infection, the team restores the web server but keeps it in a sandbox for 48 hours to watch for heartbeats.",
                  keyAspect: "Verification of 'Clean State' is mandatory." 
                },
                { 
                  id: "D7-IR-LL", label: "Lessons Learned", type: "detail", 
                  definition: "A formal review process to analyze what happened and improve future response capabilities.", 
                  enforcement: "Steps: 1. Post-mortem meeting. 2. Final report. 3. Update IR plan/policy.",
                  example: "Exam Scenario: The team realizes their manual notification process was too slow and decides to implement automated SMS alerts for future P1 incidents.",
                  keyAspect: "Most neglected but critical for continuous improvement." 
                }
              ]
            }
          ]
        },
        {
          id: "D7-PROTECT", label: "Resource Protection", type: "subdomain",
          definition: "Operational tasks to safeguard tangible and intangible organizational assets.",
          children: [
            { 
              id: "D7-MALWARE", label: "Anti-Malware", type: "detail", 
              definition: "Technical controls on endpoints and gateways to detect and block malicious software.", 
              enforcement: "Controls: Signature-based (AV), Behavioral (EDR), Sandboxing, Machine Learning.",
              example: "Exam Scenario: A zero-day Trojan is blocked by an EDR agent because it attempted to inject code into the LSASS process, a known malicious behavior.",
              keyAspect: "Defense in Depth: AV is for known threats; EDR is for unknown/lateral movement." 
            },
            { 
              id: "D7-EGRESS", label: "Egress Filtering", type: "detail", 
              definition: "Monitoring and restricting outbound traffic to ensure that internal systems aren't communicating with unauthorized destinations.", 
              enforcement: "Controls: Firewall ACLs, DNS Sinkholing, Web Proxies.",
              example: "Exam Scenario: A compromised laptop tries to 'call home' to a known C2 server, but the firewall blocks the connection due to egress rules.",
              keyAspect: "Primary control for preventing data exfiltration." 
            },
            { 
              id: "D7-HONEY", label: "Honeypots / Honeynets", type: "detail", 
              definition: "Decoy systems designed to lure attackers away from production assets and study their tactics.", 
              enforcement: "Controls: High-interaction (real OS), Low-interaction (simulated service), Padded Cells.",
              example: "Exam Scenario: An attacker spends three hours trying to crack a fake SQL database, giving the Blue Team time to trace the source IP.",
              keyAspect: "Detective and deceptive control; must not provide a launchpad for further attacks." 
            }
          ]
        },
        {
          id: "D7-CONFIG", label: "Configuration & Change", type: "subdomain",
          definition: "Ensuring systems remain in a secure, known state through their lifecycle.",
          children: [
            { 
              id: "D7-PATCH", label: "Patch Management", type: "detail", 
              definition: "The systematic identification, testing, and deployment of updates to software and firmware.", 
              enforcement: "Steps: 1. Identify. 2. Evaluate. 3. Test. 4. Deploy. 5. Audit.",
              example: "Exam Scenario: A massive data breach occurs because a 'Critical' Struts vulnerability was left unpatched for six months on a public web server.",
              keyAspect: "Testing is crucial to ensure patches don't break production services." 
            },
            { 
              id: "D7-CHANGE", label: "Change Management", type: "detail", 
              definition: "A formal process to ensure that changes to the environment are planned, approved, and documented to prevent outages.", 
              enforcement: "Steps: 1. Request. 2. Impact Assessment. 3. Approval (CAB). 4. Implement. 5. Validate. 6. Backout (if needed).",
              example: "Exam Scenario: A senior admin modifies a core switch config at 2 PM without a ticket, causing a 4-hour outage for the whole office.",
              keyAspect: "CAB (Change Advisory Board) provides oversight and risk reduction." 
            }
          ]
        },
        {
          id: "D7-RECOVERY", label: "Recovery Strategies", type: "subdomain",
          definition: "Plans for restoring business operations after a significant disruption.",
          children: [
            { 
              id: "D7-SITES", label: "Recovery Sites", type: "concept",
              children: [
                { 
                  id: "D7-SITE-HOT", label: "Hot Site", type: "detail", 
                  definition: "A fully functional, mirror-image facility with real-time data replication. Ready for immediate failover.", 
                  enforcement: "Controls: Mirrored SANs, active load balancers, 24/7 staffing.",
                  example: "Exam Scenario: A primary data center is flooded. The organization switches to its Hot Site and is back online in 15 minutes.",
                  keyAspect: "Highest cost, lowest RTO/RPO." 
                },
                { 
                  id: "D7-SITE-WARM", label: "Warm Site", type: "detail", 
                  definition: "A facility with pre-installed hardware but requiring data restoration from backups before becoming operational.", 
                  enforcement: "Controls: Periodic data shipping, standby servers.",
                  example: "Exam Scenario: A regional bank uses a Warm Site. After a disaster, they spend 12 hours restoring the previous night's tapes to the servers.",
                  keyAspect: "Moderate cost; restoration time depends on backup media speed." 
                },
                { 
                  id: "D7-SITE-COLD", label: "Cold Site", type: "detail", 
                  definition: "A shell facility with power, cooling, and network connectivity, but no servers or data present.", 
                  enforcement: "Controls: Long-term lease agreements, equipment contracts.",
                  example: "Exam Scenario: A company chooses a Cold Site for its non-critical internal apps, accepting a 2-week recovery window.",
                  keyAspect: "Lowest cost, highest RTO (weeks)." 
                }
              ]
            },
            { 
              id: "D7-BACKUP", label: "Backup Types", type: "concept",
              children: [
                { 
                  id: "D7-BU-FULL", label: "Full Backup", type: "detail", 
                  definition: "A complete copy of all selected data. It is the foundation for all other backup types.", 
                  enforcement: "Controls: Weekly schedule, clears the Archive Bit.",
                  example: "Exam Scenario: To ensure the fastest possible restore, the admin performs a Full Backup every night, ignoring the storage cost.",
                  keyAspect: "Slowest to backup, fastest to restore (1 tape)." 
                },
                { 
                  id: "D7-BU-DIFF", label: "Differential", type: "detail", 
                  definition: "Copies all files that have changed since the last FULL backup.", 
                  enforcement: "Controls: Daily schedule, does NOT clear the Archive Bit.",
                  example: "Exam Scenario: Restoring on Wednesday requires the Sunday Full Backup plus the Tuesday Differential Backup.",
                  keyAspect: "Restore requires Full + 1 tape (the latest Diff)." 
                },
                { 
                  id: "D7-BU-INCR", label: "Incremental", type: "detail", 
                  definition: "Copies only the files that have changed since the last backup of any type (Full or Incremental).", 
                  enforcement: "Controls: Daily schedule, CLEARS the Archive Bit.",
                  example: "Exam Scenario: Restoring on Wednesday requires the Sunday Full Backup, plus Monday Incremental, plus Tuesday Incremental.",
                  keyAspect: "Fastest to backup, slowest to restore (all tapes since Full)." 
                }
              ]
            }
          ]
        }
      ]
    },
    { 
      id: "D8", 
      label: "Domain 8: Software Development Security", 
      type: "domain", 
      color: MM_COLORS.DOMAIN8,
      definition: "Focuses on applying security principles to the entire software development life cycle (SDLC) to ensure applications are resilient against attacks.",
      keyAspect: "Security by Design: Security should be integrated into every phase of development, not 'bolted on' at the end.",
      children: [
        {
          id: "D8-SDLC", label: "SDLC & Dev Models", type: "subdomain",
          definition: "The frameworks used to manage software projects and their security integration points.",
          children: [
            { 
              id: "D8-PHASES", label: "SDLC Phases", type: "concept",
              children: [
                { 
                  id: "D8-REQ", label: "Planning/Requirements", type: "detail", 
                  definition: "The initial phase where the software's purpose is defined and security functional requirements are established.", 
                  enforcement: "Steps: 1. Identify stakeholders. 2. Define functional vs security requirements. 3. Privacy Impact Assessment (PIA).",
                  example: "Exam Scenario: A project manager includes a 'requirement' that all user passwords must be hashed using Argon2id before the first line of code is written.",
                  keyAspect: "Highest ROI for security; fixing errors here is 100x cheaper than in production." 
                },
                { 
                  id: "D8-DES", label: "Design", type: "detail", 
                  definition: "Creating the technical blueprint of the software, including data flow and architectural components.", 
                  enforcement: "Controls: Threat Modeling (STRIDE), Attack Surface Minimization, Secure Defaults.",
                  example: "Exam Scenario: During the design phase, an architect decides to use a 'Tiered Architecture' to isolate the database from the public internet.",
                  keyAspect: "Focus: Secure Architecture and Attack Surface reduction." 
                },
                { 
                  id: "D8-DEV", label: "Development", type: "detail", 
                  definition: "The actual coding phase where software is built according to the design specifications.", 
                  enforcement: "Controls: Secure coding standards (OWASP), manual code reviews, IDE security plugins.",
                  example: "Exam Scenario: A developer uses parameterized queries to prevent SQL injection vulnerabilities while writing the data access layer.",
                  keyAspect: "Manual vs automated review; focus on coding flaws like Buffer Overflows." 
                },
                { 
                  id: "D8-TST", label: "Testing", type: "detail", 
                  definition: "The phase dedicated to verifying that the software works as intended and satisfies security requirements.", 
                  enforcement: "Controls: SAST, DAST, Fuzzing, Regression testing, UAT (User Acceptance).",
                  example: "Exam Scenario: The security team uses a 'Fuzzer' to send millions of random characters to the login field to check for crashes.",
                  keyAspect: "Verification (Build right?) vs Validation (Right product?)." 
                },
                { 
                  id: "D8-DEP", label: "Deployment/Maintenance", type: "detail", 
                  definition: "Moving the code to production and managing it throughout its operational life.", 
                  enforcement: "Controls: Secure Configuration, Patch Management, Continuous Monitoring, Change Control.",
                  example: "Exam Scenario: An administrator disables all unused ports and services on the production server after the code is deployed.",
                  keyAspect: "Includes Disposal planning and sunsetting legacy versions." 
                }
              ]
            },
            {
              id: "D8-MODELS", label: "Dev Methodologies", type: "concept",
              children: [
                { 
                  id: "D8-WATER", label: "Waterfall", type: "detail", 
                  definition: "A linear and sequential approach where each phase must be completed before the next begins.", 
                  enforcement: "Mechanism: Rigid 'Gates' between phases.",
                  example: "Exam Scenario: A government agency uses Waterfall for a 5-year project, meaning security testing only happens in year 4.",
                  keyAspect: "Rigid, inflexible; security is often delayed to the end." 
                },
                { 
                  id: "D8-AGILE", label: "Agile", type: "detail", 
                  definition: "An iterative and incremental approach focused on flexibility and frequent delivery of small features.", 
                  enforcement: "Mechanism: 2-4 week Sprints, Scrum, Kanban.",
                  example: "Exam Scenario: A startup releases new code every two weeks, requiring security to be integrated into every 'Sprint' story.",
                  keyAspect: "Security must keep pace with rapid sprints; often uses a 'Security Champion'." 
                },
                { 
                  id: "D8-DEVOPS", label: "DevSecOps", type: "detail", 
                  definition: "The integration of security practices into the DevOps CI/CD pipeline to automate security checks.", 
                  enforcement: "Mechanism: CI/CD automation, Shift Left philosophy, Infrastructure as Code (IaC).",
                  example: "Exam Scenario: Every time a developer commits code, a 'Pipeline' automatically runs a SAST scan and blocks the build if a vulnerability is found.",
                  keyAspect: "Shift Left: Moving security tasks as early as possible in the lifecycle." 
                }
              ]
            }
          ]
        },
        {
          id: "D8-TESTING", label: "Software Testing Techniques", type: "subdomain",
          definition: "Methods used to identify flaws and vulnerabilities in software.",
          children: [
            { 
              id: "D8-SAST-D8", label: "SAST (White Box)", type: "detail", 
              definition: "Static Application Security Testing. Analyzing source code, byte code, or binaries without executing the program.", 
              enforcement: "Controls: Checkmarx, Fortify, SonarQube.",
              example: "Exam Scenario: A tool scans the C++ source code and flags a 'strcpy' function as a potential buffer overflow risk.",
              keyAspect: "Finds flaws early; high false positive rate; no runtime context." 
            },
            { 
              id: "D8-DAST-D8", label: "DAST (Black Box)", type: "detail", 
              definition: "Dynamic Application Security Testing. Testing the application while it is running from the outside.", 
              enforcement: "Controls: OWASP ZAP, Burp Suite Professional.",
              example: "Exam Scenario: A scanner crawls the live website and attempts to inject a script into the 'Comment' field to check for XSS.",
              keyAspect: "Finds environmental and runtime issues; low false positives; requires a running app." 
            },
            { 
              id: "D8-FUZZ", label: "Fuzz Testing", type: "detail", 
              definition: "A technique that sends massive amounts of random, malformed, or unexpected data (fuzz) to a program's inputs.", 
              enforcement: "Controls: Mutation-based vs Protocol-based fuzzing.",
              example: "Exam Scenario: An attacker uses a fuzzer to send invalid IP packets to a router to see if it crashes or reveals memory contents.",
              keyAspect: "Very effective for finding input validation flaws and zero-day vulnerabilities." 
            }
          ]
        },
        {
          id: "D8-DB", label: "Database Security", type: "subdomain",
          definition: "Protecting information stored in relational and non-relational database systems.",
          children: [
            { 
              id: "D8-DB-CON", label: "Database Concepts", type: "concept",
              children: [
                { 
                  id: "D8-ACID", label: "ACID Properties", type: "detail", 
                  definition: "Four properties that guarantee database transactions are processed reliably: Atomicity, Consistency, Isolation, Durability.", 
                  enforcement: "Mechanism: Transaction logs, locking, rollbacks.",
                  example: "Exam Scenario: A power failure occurs during a bank transfer. 'Atomicity' ensures the money is either in the sender's account or the receiver's, never both or neither.",
                  keyAspect: "A: All or nothing; C: Follows rules; I: Invisible to others; D: Permanent." 
                },
                { 
                  id: "D8-POLY", label: "Polyinstantiation", type: "detail", 
                  definition: "Having multiple versions of the same record at different classification levels to prevent inference.", 
                  enforcement: "Mechanism: MAC-based database engines.",
                  example: "Exam Scenario: A database shows 'Entry X' is 'Empty' for a Secret user, but 'Entry X' contains 'Flight Path' for a Top Secret user.",
                  keyAspect: "Primary defense against 'Inference' and 'Aggregation' in Multi-Level Security (MLS) systems." 
                }
              ]
            },
            { 
              id: "D8-DB-ATT", label: "Database Attacks", type: "concept",
              children: [
                { 
                  id: "D8-AGG", label: "Aggregation", type: "detail", 
                  definition: "An attack where a user combines multiple low-sensitivity items to learn a high-sensitivity fact.", 
                  enforcement: "Controls: Need-to-Know, strict access controls, limit query volume.",
                  example: "Exam Scenario: An employee views 'Shipping Logs' and 'Crate Weights' to correctly guess the number of nuclear warheads in a facility.",
                  keyAspect: "Aggregation is about the volume of data; inference is about the logic applied." 
                },
                { 
                  id: "D8-INF", label: "Inference", type: "detail", 
                  definition: "Using clues and logic to deduce hidden information without having direct access to it.", 
                  enforcement: "Controls: Polyinstantiation, Cell-level suppression, noise injection.",
                  example: "Exam Scenario: A user cannot see the CEO's salary, but sees the 'Total Payroll' and all other employees' salaries, then calculates the difference.",
                  keyAspect: "Hardest database attack to prevent; requires architectural design changes." 
                }
              ]
            }
          ]
        },
        {
          id: "D8-MAL", label: "Malicious Code", type: "subdomain",
          definition: "Software designed to infiltrate, damage, or gain unauthorized access to computer systems.",
          children: [
            { 
              id: "D8-VIR", label: "Viruses", type: "detail", 
              definition: "Malicious code that replicates by attaching itself to a host file and requires human action to spread.", 
              enforcement: "Controls: Antivirus (Signature), EDR (Behavioral).",
              example: "Exam Scenario: A user opens a 'Resume.docx' file, which executes a macro that deletes their local files.",
              keyAspect: "Key characteristics: Host required, human interaction required." 
            },
            { 
              id: "D8-WRM", label: "Worms", type: "detail", 
              definition: "Self-propagating malicious code that spreads across networks without human intervention by exploiting vulnerabilities.", 
              enforcement: "Controls: Patching, Network segmentation, Firewall egress rules.",
              example: "Exam Scenario: The 'WannaCry' worm spreads from one unpatched Windows machine to another in the same subnet automatically.",
              keyAspect: "Goal: Exhaust network bandwidth and spread rapidly; no host required." 
            },
            { 
              id: "D8-TRO", label: "Trojans", type: "detail", 
              definition: "Malicious software that disguises itself as a legitimate or desirable program to trick users into installing it.", 
              enforcement: "Controls: Code signing, Application Allow-listing, user training.",
              example: "Exam Scenario: A user downloads a 'Free Performance Booster' app, but it actually installs a keylogger in the background.",
              keyAspect: "Often used for backdoors and remote access (RATs)." 
            },
            { 
              id: "D8-RTK", label: "Rootkits", type: "detail", 
              definition: "Sophisticated malicious software that grants administrative (root) access while hiding its presence from the OS and security tools.", 
              enforcement: "Controls: Secure Boot (UEFI), TPM, file integrity monitoring.",
              example: "Exam Scenario: A rootkit replaces the 'ls' command in Linux so it never shows the malicious files hidden on the disk.",
              keyAspect: "Targets kernel, bootloader, or hypervisor; extremely difficult to detect once active." 
            }
          ]
        }
      ]
    }
  ]
};
