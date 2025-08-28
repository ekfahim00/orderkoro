import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#f9fafb", 
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#3730a3", 
  },
  section: {
    marginBottom: 16,
    padding: 12,
    border: "1px solid #e5e7eb", 
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937", 
  },
  textRow: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  label: {
    fontWeight: "bold",
    color: "#374151", 
  },
  value: {
    color: "#111827",
  },
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTop: "1px solid #d1d5db",
    fontSize: 10,
    color: "#6b7280",
  },
});

const DashboardReport = ({ restaurant }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Restaurant Report</Text>
      <View style={styles.section}>
        <Text style={styles.heading}>Restaurant Info</Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Name: </Text>
          <Text style={styles.value}>{restaurant.name}</Text>
        </Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Address: </Text>
          <Text style={styles.value}>{restaurant.address}</Text>
        </Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Total Orders: </Text>
          <Text style={styles.value}>{restaurant.totalOrders}</Text>
        </Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Rating: </Text>
          <Text style={styles.value}>{restaurant.rating}/5</Text>
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Best Selling Items</Text>
        <Text style={styles.textRow}>• Coming soon</Text>
        <Text style={styles.textRow}>• Coming soon</Text>
        <Text style={styles.textRow}>• Coming soon</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Performance</Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>This Week: </Text> N/A
        </Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Last Week: </Text> N/A
        </Text>
        <Text style={styles.textRow}>
          <Text style={styles.label}>Difference: </Text> N/A
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>Generated: {new Date().toLocaleString()}</Text>
        <Text>Restaurant ID: {restaurant.ownerId}</Text>
      </View>
    </Page>
  </Document>
);

export default DashboardReport;
