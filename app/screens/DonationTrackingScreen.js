// DonationTrackingScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getUserDonations } from './apicalls'; // Import the new API call function

const DonationTrackingScreen = ({ route }) => {
    const { userId } = route.params; // Get userId from route params
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add state for error handling

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await getUserDonations(userId); // Use the new API call
                setDonations(response);
            } catch (error) {
                console.error(error);
                setError('Failed to fetch donations. Please try again later.'); // Set error message
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Donations:</Text>
            {donations.length === 0 ? (
                <Text style={styles.noDonationsText}>No donations found.</Text>
            ) : (
                <FlatList
                    data={donations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.donationItem}>
                            <Text style={styles.donationText}>Book Title: {item.bookTitle}</Text>
                            <Text style={styles.donationText}>Author: {item.author}</Text>
                            <Text style={styles.donationText}>Donation Date: {new Date(item.donation_date).toLocaleDateString()}</Text>
                            <Text style={styles.donationText}>Status: {item.status}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    donationItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9', // Add a background color for better readability
    },
    donationText: {
        fontSize: 16,
    },
    noDonationsText: {
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
});

export default DonationTrackingScreen;
