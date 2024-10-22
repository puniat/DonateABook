import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
// **Import the API methods from apicalls.js**
import { getUserProfile, trackDonations } from '../apiCalls';
import { useUser } from '../../UserContext'; // Import UserContext for user data

const UserProfileScreen = ({ route, navigation }) => {
    const { user, logout } = useUser(); // Use UserContext to get user info and logout function
    const [userProfile, setUserProfile] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);  // **State to handle errors**

    useEffect(() => {
        if (!user?.userId) {
            Alert.alert('Error', 'User ID is missing!');
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);  // **Set loading to true before the API calls**

            try {
                // **Replace axios call with getUserProfile method from apicalls.js**
                const userProfileData = await getUserProfile(user.userId);
                setUserProfile(userProfileData);

                // **Replace axios call with trackDonations method from apicalls.js**
                const donationData = await trackDonations(user.userId);
                setDonations(donationData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load user data. Please try again.');  // **Set an error message**
            } finally {
                setLoading(false);  // **Set loading to false after the API calls are done**
            }
        };

        fetchUserData();
    }, [user?.userId]);

    // **Display an error message if an error occurs**
    if (error) return <Text style={styles.errorText}>{error}</Text>;

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    const handleLogout = async () => {
        // Clear user session data
        try {
            logout();
            Alert.alert('Logout', 'You have been logged out.');
            navigation.navigate('Welcome'); // Change 'Login' to your actual login screen name
        } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Logout Error', 'Failed to log out. Please try again.');
        }
    };

    const navigateToHomepage = () => {
        navigation.navigate('Homepage'); // Change 'Homepage' to your actual homepage screen name
    };

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
                        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}  // Use index if id is undefined
                        renderItem={({ item }) => (
                            <View style={styles.donationItem}>
                                <Text>Book ID: {item.book_id}</Text>
                                <Text>Donation Date: {new Date(item.donation_date).toLocaleDateString()}</Text>
                                <Text>Status: {item.status}</Text>
                            </View>
                        )}
                        initialNumToRender={5}  // Performance optimization
                        maxToRenderPerBatch={10}  // Performance optimization
                    />
                )}
            </View>

            {/* Logout Button */}
            <Button title="Logout" onPress={handleLogout} color="#ff5722" />

            {/* Navigate to Homepage Button */}
            <Button title="Go to Homepage" onPress={navigateToHomepage} color="#4CAF50" />
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
    errorText: {   // **Style for error messages**
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginVertical: 20,
    }
});

export default UserProfileScreen;
