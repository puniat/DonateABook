import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { UserProvider } from './UserContext';
import * as Screens from './app/screens/index';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            {<Stack.Screen name="Welcome" component={Screens.WelcomeScreen} />}
            <Stack.Screen name="Login" component={Screens.LoginScreen} />
            <Stack.Screen name="Signup" component={Screens.SignupScreen} />
            <Stack.Screen name="HomePage" component={Screens.HomePageScreen} />
            <Stack.Screen name="AddBook" component={Screens.AddBook} />
            <Stack.Screen name="Address" component={Screens.Address} />
            <Stack.Screen name="SearchResults" component={Screens.SearchResultsScreen} />
            <Stack.Screen name="UserProfile" component={Screens.UserProfileScreen} />
            {/* <Stack.Screen name="DonationTracking" component={Screens.SearchResultsScreen} /> */}
          </Stack.Navigator>
        </NavigationContainer>
    </UserProvider>
  );
};

export default App;
