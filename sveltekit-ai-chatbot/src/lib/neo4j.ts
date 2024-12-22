import neo4j from 'neo4j-driver';
import 'dotenv/config';

const driver = neo4j.driver(
	process.env.NEO4J_URI || 'bolt://localhost:7687',
	neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

export const queryNeo4j = async (query: string, params: Record<string, any> = {}) => {
	const session = driver.session();
	try {
		console.log('Connecting to Neo4j with:', process.env.NEO4J_URI, process.env.NEO4J_USER);
		const result = await session.run(query, params);
		return result.records.map((record) => record.toObject());
	} catch (error) {
		console.error('Neo4j Query Error:', error);
		throw new Error('Failed to query Neo4j');
	} finally {
		await session.close();
	}
};

export default driver;
