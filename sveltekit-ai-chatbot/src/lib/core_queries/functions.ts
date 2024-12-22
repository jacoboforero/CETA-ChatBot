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

/**
 * Finds the largest connected subgraph in the database, optionally filtered by node label and relationship type.
 * @param label - (Optional) Node label to filter the subgraph.
 * @param relationshipType - (Optional) Relationship type to filter the subgraph.
 * @returns - Subgraph of the largest connected component.
 */

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

/**
 * Retrieves a node from the Neo4j database based on its unique identifier.
 * @param id - The unique identifier of the node (e.g., RSSD ID, LEI, UUID).
 * @param label - (Optional) Node label to narrow the search.
 * @returns - The node object.
 */

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

/**
 * Fetches all nodes that match a specific label from the Neo4j database.
 * @param label - The label of the nodes to fetch (e.g., Company, Bank).
 * @param limit - (Optional) The maximum number of nodes to retrieve.
 * @returns - An array of nodes matching the specified label.
 */
export async function getNodesByLabel(label: string, limit?: number) {
	// Build the Cypher query with optional limit
	const cypherQuery = `
		MATCH (n:${label})
		RETURN n
		${limit ? `LIMIT ${limit}` : ''}
	`;

	try {
		// Execute the query against the Neo4j database
		const result = await queryNeo4j(cypherQuery);
		return result; // Return the array of nodes
	} catch (error) {
		console.error('Error fetching nodes by label:', error);
		throw new Error('Failed to fetch nodes by label from the database');
	}
}

/**
 * Retrieves relationships associated with a specific node, optionally filtered by type.
 * @param nodeId - The unique identifier of the node (e.g., RSSD ID, LEI, UUID).
 * @param relationshipType - (Optional) The type of relationship to filter by.
 * @returns - An array of relationship objects.
 */
export async function getNodeRelationships(nodeId: string, relationshipType?: string) {
	// Build the Cypher query dynamically based on the presence of a relationshipType
	const relationshipFilter = relationshipType ? `:${relationshipType}` : '';
	const cypherQuery = `
		MATCH (n {ID_RSSD: $nodeId})-[r${relationshipFilter}]-(m)
		RETURN r
	`;

	try {
		// Execute the query against the Neo4j database
		const result = await queryNeo4j(cypherQuery, { nodeId });
		return result; // Return the array of relationships
	} catch (error) {
		console.error('Error retrieving relationships for node:', error);
		throw new Error('Failed to retrieve relationships from the database');
	}
}

/**
 * Ranks entities by a given property in the database.
 * @param label - The label of the nodes to rank (e.g., Company, Bank).
 * @param property - The property to rank nodes by (e.g., total assets, connections).
 * @param order - (Optional) The order of ranking: 'asc' (ascending) or 'desc' (descending). Defaults to 'desc'.
 * @param limit - (Optional) The maximum number of ranked nodes to retrieve.
 * @returns - An array of ranked nodes.
 */
export async function rankEntitiesByProperty(
	label: string,
	property: string,
	order: 'asc' | 'desc' = 'desc',
	limit?: number
) {
	// Validate the order parameter
	if (order !== 'asc' && order !== 'desc') {
		throw new Error("Invalid order parameter. Must be 'asc' or 'desc'.");
	}

	// Build the Cypher query dynamically based on the parameters
	const cypherQuery = `
		MATCH (n:${label})
		WHERE exists(n.${property})
		RETURN n
		ORDER BY n.${property} ${order.toUpperCase()}
		${limit ? `LIMIT ${limit}` : ''}
	`;

	try {
		// Execute the query against the Neo4j database
		const result = await queryNeo4j(cypherQuery);
		return result; // Return the array of ranked nodes
	} catch (error) {
		console.error('Error ranking entities by property:', error);
		throw new Error('Failed to rank entities by property in the database');
	}
}
