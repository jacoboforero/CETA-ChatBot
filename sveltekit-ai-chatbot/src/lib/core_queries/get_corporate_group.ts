// Retrieves all nodes and relationships belonging to a specific corporate group (e.g., subsidiaries, parent companies).
// Parameters: rootNodeId: string
// Return Type: Subgraph of related entities

import { queryNeo4j } from '$lib/neo4j';

export async function getCorporateGroup(rootNodeId: string) {
	// Define the Cypher query to retrieve all related nodes and relationships
	const cypherQuery = `
        MATCH (root {ID_RSSD: $rootNodeId})
        OPTIONAL MATCH (root)-[r*1..]->(related)
        RETURN root, r, related
    `;

	try {
		// Query the Neo4j database with the root node ID
		const result = await queryNeo4j(cypherQuery, { rootNodeId });
		return result; // Return the subgraph as an array of records
	} catch (error) {
		console.error('Error retrieving corporate group:', error);
		throw new Error('Failed to retrieve corporate group from the database');
	}
}
