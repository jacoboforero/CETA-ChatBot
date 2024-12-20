from neo4j import GraphDatabase
import json
from datetime import datetime

def serialize(obj):
    """Serialize non-JSON serializable objects."""
    if isinstance(obj, datetime):
        return obj.isoformat()  # Convert DateTime to ISO 8601 string
    if hasattr(obj, 'iso_format'):  # For Neo4j DateTime objects
        return obj.iso_format()
    if hasattr(obj, '__dict__'):  # For custom objects
        return obj.__dict__
    return str(obj)  # Fallback to string representation

class Neo4jSchemaExtractor:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        self.driver.close()

    def run_query(self, query):
        with self.driver.session() as session:
            result = session.run(query)
            return [record.data() for record in result]

    def get_labels(self):
        query = "CALL db.labels()"
        return self.run_query(query)

    def get_relationship_types(self):
        query = "CALL db.relationshipTypes()"
        return self.run_query(query)

    def get_property_keys(self):
        query = "CALL db.propertyKeys()"
        return self.run_query(query)

    def get_sample_nodes(self, label, limit=10):
        query = f"MATCH (n:{label}) RETURN n LIMIT {limit}"
        return self.run_query(query)

    def get_relationship_details(self, rel_type):
        query = f"""
        MATCH (a)-[r:{rel_type}]->(b)
        RETURN DISTINCT labels(a) AS start_labels, labels(b) AS end_labels, keys(r) AS properties
        """
        return self.run_query(query)

    def get_node_property_types(self):
        query = "CALL db.schema.nodeTypeProperties()"
        return self.run_query(query)

    def get_indexes(self):
        query = "SHOW INDEXES"
        return self.run_query(query)

    def get_constraints(self):
        query = "SHOW CONSTRAINTS"
        return self.run_query(query)

    def get_graph_meta(self):
        query = "CALL apoc.meta.graph()"
        return self.run_query(query)

    def get_relationship_cardinality(self, rel_type):
        query = f"""
        MATCH (a)-[r:{rel_type}]->(b)
        RETURN COUNT(DISTINCT a) AS distinct_start_nodes, COUNT(r) AS relationship_count
        """
        return self.run_query(query)

    def extract_schema(self):
        schema = {}

        # 1. Node Labels
        print("Extracting node labels...")
        schema['node_labels'] = self.get_labels()

        # 2. Relationship Types
        print("Extracting relationship types...")
        schema['relationship_types'] = self.get_relationship_types()

        # 3. Property Keys
        print("Extracting property keys...")
        schema['property_keys'] = self.get_property_keys()

        # 4. Sample Nodes for Each Label
        print("Extracting sample nodes for each label...")
        schema['sample_nodes'] = {}
        for label in [item['label'] for item in schema['node_labels']]:
            schema['sample_nodes'][label] = self.get_sample_nodes(label)

        # 5. Relationship Details
        print("Extracting relationship details...")
        schema['relationship_details'] = {}
        for rel_type in [item['relationshipType'] for item in schema['relationship_types']]:
            schema['relationship_details'][rel_type] = self.get_relationship_details(rel_type)

        # 6. Node Property Types
        print("Extracting node property types...")
        schema['node_property_types'] = self.get_node_property_types()

        # 7. Indexes
        print("Extracting indexes...")
        schema['indexes'] = self.get_indexes()

        # 8. Constraints
        print("Extracting constraints...")
        schema['constraints'] = self.get_constraints()

        # 9. Graph Meta-Information
        print("Extracting graph meta-information...")
        schema['graph_meta'] = self.get_graph_meta()

        # 10. Relationship Cardinality
        print("Extracting relationship cardinality...")
        schema['relationship_cardinality'] = {}
        for rel_type in [item['relationshipType'] for item in schema['relationship_types']]:
            schema['relationship_cardinality'][rel_type] = self.get_relationship_cardinality(rel_type)

        return schema

# Usage
if __name__ == "__main__":
    # Connection details
    URI = "bolt://localhost:7687"  # Replace with your Neo4j instance URI
    USER = "neo4j"                 # Replace with your username
    PASSWORD = "jacobo2004"          # Replace with your password

    # Initialize the extractor
    extractor = Neo4jSchemaExtractor(URI, USER, PASSWORD)

    try:
        print("Extracting schema...")
        schema = extractor.extract_schema()

        # Save schema to a file or print it
        import json
        with open("neo4j_schema.json", "w") as f:
             json.dump(schema, f, indent=4, default=serialize)

        print("Schema extraction completed. Results saved to 'neo4j_schema.json'.")
    finally:
        extractor.close()
