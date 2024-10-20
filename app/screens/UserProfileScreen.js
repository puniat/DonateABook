import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
// **Import the API methods from apicalls.js**
import { getUserProfile, trackDonations } from '../apiCalls';


const UserProfileScreen = ({ route }) => {
    const { userId } = route.params; // Get userId from route params
    const [userProfile, setUserProfile] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);  // **Set loading to true before the API calls**

            try {
                // **Replace axios call with getUserProfile method from apicalls.js**
                const userProfileData = await getUserProfile(userId);
                setUserProfile(userProfileData);

                // **Replace axios call with trackDonations method from apicalls.js**
                const donationData = await trackDonations(userId);
                setDonations(donationData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);  // **Set loading to false after the API calls are done**
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
        <View style={styles.container}>
            {userProfile && (
                <View style={styles.profileSection}>
                    <Text style={styles.title}>User Profile:</Text>
                    <Text>Name: {userProfile.name}</Text>
                    <Text>Email: {userProfile.email}</Text>
                    {/* Add other user profile fields as necessary */}
                </View>
            )}

            <View style={styles.donationsSection}>
                <Text style={styles.title}>Your Donations:</Text>
                {donations.length === 0 ? (
                    <Text>No donations made yet.</Text>
                ) : (
                    <FlatList
                        data={donations}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.donationItem}>
                                <Text>Book ID: {item.book_id}</Text>
                                <Text>Donation Date: {new Date(item.donation_date).toLocaleDateString()}</Text>
                                <Text>Status: {item.status}</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        marginBottom: 20,
    },
    donationsSection: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    donationItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
});

export default UserProfileScreen;
