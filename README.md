# CETA Chatbot: Exploring Corporate Ownership Structures with AI

CETA (Corporate Entity Tracking and Analysis) Chatbot is a research initiative aimed at testing machine learning techniques, particularly Large Language Models (LLMs), for querying and extracting valuable insights from complex datasets without requiring advanced technical expertise. This project enables users, including researchers, developers, and business professionals, to analyze corporate ownership structures and uncover impactful data patterns.

---

## Vision

The vision of this project is to empower users to extract actionable insights into corporate ownership structures—such as identifying national security concerns or economic trends—through natural language queries, without needing expertise in Cypher queries or computer science.

By integrating data from the **FFIEC NIC** and **GLEIF LEI** databases, CETA provides a unified platform to investigate economic and security-related questions through graph-based data analysis.

For more details on the dataset and its context, visit [CETA Live](https://appleseedlab.github.io/cetalive/).

**Important Note:**: This README outlines the plan and vision for features however at this stage only simple queries have been implemented. We are actively working on this project. 

---

## Key Features

- **LLM-Powered Chatbot**: Users can interact with the database through an AI chatbot capable of translating natural language queries into Cypher queries for Neo4j.
- **Graph-Based Data Modeling**: Data from FFIEC NIC and GLEIF LEI is modeled as a graph, enabling exploration of relationships, timelines, and corporate hierarchies.
- **Data Integration**: Seamlessly links entities across both datasets, allowing comprehensive corporate ownership analysis.
- **Insight Extraction**: Facilitates research into topics like:
  - Economic patterns
  - Corporate consolidation trends
  - National security concerns
- **User-Friendly Interface**: Simplifies complex graph queries into conversational, human-readable outputs.

---

## Audience

This project is designed for:
- Researchers in business, economics, and national security.
- Developers and data scientists interested in graph databases and LLM applications.
- Analysts seeking to explore corporate relationships and patterns without deep technical expertise.

---

## Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Node.js (API built with SvelteKit's server-side routing)
- **Graph Database**: Neo4j
- **Machine Learning**: OpenAI's GPT models for natural language processing
- **Deployment**: Vercel
- **Data Sources**: FFIEC NIC, GLEIF LEI (graph-modeled)

---

## Installation and Configuration

### Prerequisites
1. **Node.js**: Install the latest LTS version of Node.js.
2. **Neo4j**: Install and set up a Neo4j database (version 5.0 or higher).
3. **Vercel Account**: For deployment.

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd ceta-chatbot
2. **Install Dependencies**:
   ```bash
   npm install
3. **Set Up Neo4j**:
- Start your Neo4j database.
- Import the dump file. Instructions available at https://appleseedlab.github.io/cetalive/
- Configure the database to run on the default bolt://localhost:7687.
4. **Configure environment variables**:
   Create a .env file in the root directory and add the following:
   ```
    OPENAI_API_KEY=<your-openai-api-key>
    NEO4J_URI=bolt://localhost:7687
    NEO4J_USERNAME=neo4j
    NEO4J_PASSWORD=<your-database-password>
   ```

5. **Run Locally: Start the development server**:
   ```bash
   npm run dev

## Usage

### Query Examples

#### Simple Questions:
- "Find all entities associated with the name 'Wells Fargo'"
- "What is the largest corporate group in California?"

#### Complex Questions:
- "What was the largest bank holding company in Indiana in the 1980s?"
- "Which corporate groups have shrunk the most in the last 5 years?"

#### Graph Exploration:
- "Show all subsidiaries of 'Company X' and their ownership percentages."
- "Find the entity with the most relationships in the database."

---

## Functional Breakdown

The project encapsulates key queries into **core functions** and delegates complex queries into **multi-step processes**. This ensures reliability and modularity while reducing syntax errors.

---

## Contributing

Contributions to the project are welcome! Here are some ways to get involved:
- Add or refine **core functions** for common queries.
- Enhance LLM prompt engineering for better Cypher query generation.
- Optimize performance and scalability of the Neo4j integration.

To contribute:
1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with detailed descriptions of changes.

---

## Lead Contributors

- **Dr. Paul Gazzillo**: Lead Researcher
- **Jacobo Forero**: UCF Student

---

## Acknowledgments

- **FFIEC NIC**: A critical source for U.S. financial institution data.
- **GLEIF LEI**: A global reference for entity identification.
- **UCF APPLESEED Lab**: The Applied Programming Languages, Software Engineering, and Education (APPLeSEEd) Lab tackles problems in software, security, and systems and cultivates computational thinking.

---


## License

This project is open-source under the [MIT License](./LICENSE).

---

## Contact

For questions or collaborations, please contact:
- **Paul Gazzillo**: contact@pgazz.com
- **Jacobo Forero**: jacobo.forero@hotmail.com

