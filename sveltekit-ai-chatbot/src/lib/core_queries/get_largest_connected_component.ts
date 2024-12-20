/**
 * Finds the largest connected subgraph in the database, optionally filtered by node label and relationship type.
 * @param label - (Optional) Node label to filter the subgraph.
 * @param relationshipType - (Optional) Relationship type to filter the subgraph.
 * @returns - Subgraph of the largest connected component.
 */

import { queryNeo4j } from '$lib/neo4j';

export async function getLargestConnectedSubgraph(label?: string, relationshipType?: string) {
	// Build the Cypher query dynamically based on provided parameters
	const labelFilter = label ? `:${label}` : '';
	const relationshipFilter = relationshipType ? `:${relationshipType}` : '';

	const cypherQuery = `
		// Match all connected components and calculate their sizes
		MATCH (n${labelFilter})
		OPTIONAL MATCH (n)-[r${relationshipFilter}]-(m)
		WITH collect(n) + collect(m) AS nodes, collect(r) AS relationships
		WITH apoc.coll.toSet(nodes) AS uniqueNodes, relationships
		RETURN uniqueNodes, relationships
		ORDER BY size(uniqueNodes) DESC
		LIMIT 1
	`;

	try {
		// Execute the query against the Neo4j database
		const result = await queryNeo4j(cypherQuery);
		return result; // Return the largest connected subgraph
	} catch (error) {
		console.error('Error retrieving largest connected subgraph:', error);
		throw new Error('Failed to retrieve the largest connected subgraph');
	}
}
