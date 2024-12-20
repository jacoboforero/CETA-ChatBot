/**
 * Retrieves a node from the Neo4j database based on its unique identifier.
 * @param id - The unique identifier of the node (e.g., RSSD ID, LEI, UUID).
 * @param label - (Optional) Node label to narrow the search.
 * @returns - The node object.
 */

import { queryNeo4j } from '$lib/neo4j';
export async function getNodeById(id: string, label?: string) {
	// Build the Cypher query dynamically based on the presence of a label
	const labelFilter = label ? `:${label}` : '';
	const cypherQuery = `
		MATCH (n${labelFilter})
		WHERE n.ID_RSSD = $id OR n.ID_LEI = $id OR n.UUID = $id
		RETURN n
		LIMIT 1
	`;

	try {
		// Execute the query against the Neo4j database
		const result = await queryNeo4j(cypherQuery, { id });
		if (result.length === 0) {
			throw new Error(`No node found with the identifier: ${id}`);
		}
		return result[0]; // Return the first matching node
	} catch (error) {
		console.error('Error retrieving node by ID:', error);
		throw new Error('Failed to retrieve node from the database');
	}
}
