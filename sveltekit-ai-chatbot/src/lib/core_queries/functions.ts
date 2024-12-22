// Generalized Neo4j Utility File
// Provides flexible building blocks for querying nodes, relationships, subgraphs, and ranking.

// Imports
import { queryNeo4j } from '$lib/neo4j';

/**
 * Executes any Cypher query with optional parameters.
 */
export async function executeQuery(query: string, params: Record<string, any> = {}) {
	try {
		return await queryNeo4j(query, params);
	} catch (error) {
		console.error('Error executing query:', error);
		throw new Error('Failed to execute query in the database');
	}
}

/**
 * Fetches nodes by optional label, with optional filters, relationships, and limit.
 */
export async function fetchNodes(
	label?: string,
	filters: Record<string, any> = {},
	relationships?: string,
	limit?: number
) {
	const labelFilter = label ? `:${label}` : '';
	const relationshipClause = relationships ? `-[r:${relationships}]-(m)` : '';
	const whereClause = Object.keys(filters)
		.map((key) => `n.${key} = $${key}`)
		.join(' AND ');

	const cypherQuery = `
		MATCH (n${labelFilter})${relationshipClause}
		${whereClause ? `WHERE ${whereClause}` : ''}
		RETURN n
		${limit ? `LIMIT ${limit}` : ''}
	`;

	return executeQuery(cypherQuery, filters);
}

/**
 * Fetches relationships for a node by ID, optionally filtered by type and direction.
 */
export async function fetchRelationships(
	nodeId: string,
	relationshipType?: string,
	direction: 'in' | 'out' | 'both' = 'both'
) {
	const relationshipFilter = relationshipType ? `:${relationshipType}` : '';
	const directionSymbol = direction === 'in' ? '<-' : direction === 'out' ? '->' : '-';

	const cypherQuery = `
		MATCH (n {ID_RSSD: $nodeId})${directionSymbol}[r${relationshipFilter}]${directionSymbol}(m)
		RETURN r
	`;

	return executeQuery(cypherQuery, { nodeId });
}

/**
 * Ranks entities by a given property on nodes of a specified label.
 */
export async function rankEntities(
	label: string,
	property: string,
	order: 'asc' | 'desc' = 'desc',
	limit?: number
) {
	if (order !== 'asc' && order !== 'desc') {
		throw new Error("Invalid order parameter. Must be 'asc' or 'desc'.");
	}

	const cypherQuery = `
		MATCH (n:${label})
		WHERE exists(n.${property})
		RETURN n
		ORDER BY n.${property} ${order.toUpperCase()}
		${limit ? `LIMIT ${limit}` : ''}
	`;

	return executeQuery(cypherQuery);
}

/**
 * Fetches a subgraph starting from a root node, optionally filtered by label and relationship type.
 */
export async function fetchSubgraph(rootNodeId: string, label?: string, relationshipType?: string) {
	const labelFilter = label ? `:${label}` : '';
	const relationshipFilter = relationshipType ? `:${relationshipType}` : '';

	const cypherQuery = `
		MATCH (root {ID_RSSD: $rootNodeId})-[r${relationshipFilter}]-(related${labelFilter})
		RETURN root, r, related
	`;

	return executeQuery(cypherQuery, { rootNodeId });
}
