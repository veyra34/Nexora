# Noun–Verb Analysis — Nexora

## 1. Use Cases Analysed

The noun–verb analysis is based on the following three use cases:

1. Register / Login
2. View Upcoming Contests
3. Get AI Problem Recommendations

---

## 2. Raw Candidate List

The following nouns and noun phrases were identified from the three use-case specifications.

| Candidate | Source Use Case |
|---|---|
| User | Register / Login |
| Account | Register / Login |
| Account information | Register / Login |
| Credentials | Register / Login |
| System | Register / Login |
| Contest | View Upcoming Contests |
| Contest information | View Upcoming Contests |
| Contest sources | View Upcoming Contests |
| Contest platforms | View Upcoming Contests |
| Contests section | View Upcoming Contests |
| Gemini AI | Get AI Problem Recommendations |
| Recommendation | Get AI Problem Recommendations |
| Problem | Get AI Problem Recommendations |
| Request | Get AI Problem Recommendations |
| Context | Get AI Problem Recommendations |
| AI service | Get AI Problem Recommendations |

---

## 3. Verb Analysis

The main verbs and actions identified from the use-case specifications are:

| Verb / Action | Source Use Case |
|---|---|
| open | Register / Login |
| select | Register / Login |
| enter | Register / Login |
| validate | Register / Login |
| authenticate | Register / Login |
| create | Register / Login |
| grant access | Register / Login |
| detect | Register / Login |
| display | Register / Login |
| request | View Upcoming Contests |
| retrieve | View Upcoming Contests |
| organize | View Upcoming Contests |
| display | View Upcoming Contests |
| select | View Upcoming Contests |
| obtain | View Upcoming Contests |
| update | View Upcoming Contests |
| retry | View Upcoming Contests |
| select | Get AI Problem Recommendations |
| provide | Get AI Problem Recommendations |
| send | Get AI Problem Recommendations |
| process | Get AI Problem Recommendations |
| receive | Get AI Problem Recommendations |
| present | Get AI Problem Recommendations |
| generate | Get AI Problem Recommendations |
| ask | Get AI Problem Recommendations |

---

## 4. Candidate Filtering

Each noun candidate is evaluated to determine whether it should become a domain class.

| Candidate | Decision | Reason |
|---|---|---|
| User | Survives | Represents the main user of the system |
| Account | Survives | Represents the user's Contestify account |
| Contest | Survives | Represents a core entity in the contest functionality |
| Problem | Survives | Represents a problem used for competitive-programming practice |
| Recommendation | Survives | Represents the recommendation generated for the user |
| Account information | Discarded | Information belonging to an Account |
| Credentials | Discarded | Information used during authentication |
| System | Discarded | Generic system term, not a domain entity |
| Contest information | Discarded | Information belonging to a Contest |
| Contest sources | Discarded | Source information rather than an independent domain class |
| Contest platforms | Discarded | External platform/source concept |
| Contests section | Discarded | User-interface/navigation element |
| Gemini AI | Discarded | External AI actor/service |
| Request | Discarded | Represents an input/action rather than a domain entity |
| Context | Discarded | Information supplied for generating recommendations |
| AI service | Discarded | External service rather than an internal domain class |

> **Note:** The assignment requires the discarded candidates to be identified using the four filters taught in the course. The provided assignment document does not specify the names or definitions of those four filters. Therefore, the exact filter names should be added according to the course material.

---

## 5. Surviving Classes

After the candidate analysis, the following classes are retained:

- User
- Account
- Contest
- Problem
- Recommendation

---

## 6. Verb-to-Responsibility Mapping

The identified verbs will help determine the responsibilities and operations of the surviving classes.

| Class | Possible Responsibilities |
|---|---|
| User | Register, login, provide information, request recommendations |
| Account | Store account information, support authentication |
| Contest | Store contest information, provide contest details |
| Problem | Represent problems for competitive-programming practice |
| Recommendation | Represent and provide AI-generated problem recommendations |

---

## 7. Result

The surviving classes identified through noun–verb analysis will be used in the next stage to create the CRC cards.

The CRC cards will define:

- Class
- Responsibilities
- Collaborators

These classes will later be used to create the domain class diagram and object diagram.