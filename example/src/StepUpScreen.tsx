import * as React from 'react';
import XmBindIdSdk from 'bindid-react-native';
import { SafeAreaView, StyleSheet, View, Image, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import type { NavigationStackProp } from 'react-navigation-stack';

import env from './env';
import style from './style';

import { XmBindIdScopeType } from "../../src/transmit-bind-id-api";
import type { XmBindIdAuthenticationRequest , XmBindIdResponse, XmBindIdTransactionSigningRequest, XmBindIdTransactionSigningDisplayData, XmBindIdTransactionSigningData } from "../../src/transmit-bind-id-api";

type StepUpScreenProps = {
    navigation: NavigationStackProp<{}>;
};

interface State {
    authenticationInProgress: boolean;
    isAuthenticationError: boolean;
    errorMessage: string;
}

export class StepUpScreen extends React.Component<StepUpScreenProps, State> {

    constructor(props: StepUpScreenProps) {
        super(props);

        this.state = {
            authenticationInProgress: false,
            isAuthenticationError: false,
            errorMessage: ""
        };
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Image
                    style={styles.brandingLogo}
                    source={require('./assets/img/transmit_logo.png')}
                />
                <View style={styles.authenticateButtonContainer}>
                    {this.renderAuthenticateButton()}
                </View>
                {(this.state.isAuthenticationError) ? <Text style={styles.errorMessage}>Error authenticating with BindID: {this.state.errorMessage}</Text> : null}
            </SafeAreaView>
        );
    }

    private authenticateWithBindID = async (): Promise<void> => {
        /**
         * redirectURI: A valid URL that will be triggered by the BindID serviec. The app should be able to support handling it
         * usePkce: This enables using a PKCE flow (RFC-7636) to securely obtain the ID and access token through the client.
         * scope: openId is the default configuration, you can also add .email, .networkInfo, .phone
         */

        this.setState({  authenticationInProgress: false,
            isAuthenticationError: false,
            errorMessage: "" });

        const request: XmBindIdAuthenticationRequest = {
            redirectUri: env.RedirectURI,
            scope: [XmBindIdScopeType.OpenId, XmBindIdScopeType.Email],
            usePkce: true
        };

        XmBindIdSdk.authenticate(request)
            .then((response: XmBindIdResponse) => {
                console.log(`BindID Authentication Completed: ${JSON.stringify(response)}`);
                this.handleAuthenticationResponse(response);
            }).catch((error: XmBindIdError) => {
                console.log(`BindID Authentication Failed: ${JSON.stringify(error)}`);
                this.handleAuthenticationError(error);
            });
    }

    private signTransactionBindID = async (): Promise<void> => {
        /**
         * redirectURI: A valid URL that will be triggered by the BindID serviec. The app should be able to support handling it
         * usePkce: This enables using a PKCE flow (RFC-7636) to securely obtain the ID and access token through the client.
         * scope: openId is the default configuration, you can also add .email, .networkInfo, .phone
         */

        this.setState({  
            authenticationInProgress: false,
            isAuthenticationError: false,
            errorMessage: "" });

        const displayData: XmBindIdTransactionSigningDisplayData = {
            payee: "Jonh Depp",
            paymentAmount: "100$",
            paymentMethod: "PayPal"
        };

        const transactionSigningData: XmBindIdTransactionSigningData = {
            displayData: displayData
        };

        const request: XmBindIdTransactionSigningRequest = {
            redirectUri: env.RedirectURI,
            transactionSigningData: transactionSigningData,
            encrypted: true,
            usePkce: true
        };

        XmBindIdSdk.signTransaction(request)
            .then((response: XmBindIdResponse) => {
                console.log(`BindID Sign Transaction Completed: ${JSON.stringify(response)}`);
                this.handleAuthenticationResponse(response);
            }).catch((error: XmBindIdError) => {
                console.log(`BindID Sign Transaction Failed: ${JSON.stringify(error)}`);
                this.handleAuthenticationError(error);
            });
    }


    private handleAuthenticationResponse = async (response: XmBindIdResponse): Promise<void> => {
    
        this.setState({ isAuthenticationError: false, errorMessage: "", authenticationInProgress: false });
        
        // After validation of the token we can navigate to the Authenticated User Screen and present the token data
        this.props.navigation.navigate('AuthenticatedUserScreen', { response: response });
    }

    private handleAuthenticationError(error: XmBindIdError): void {
        this.setState({
            isAuthenticationError: true,
            errorMessage: `${error.code} ${error.message}`,
            authenticationInProgress: false
        });
    }

    private renderAuthenticateButton = (): React.ReactElement => {
        if (this.state.authenticationInProgress) {
            return (<ActivityIndicator size="small" />);
        }

        return (
            <View style={{ flexDirection:"column" }}>
    <View>
    <TouchableOpacity onPress={() => this.authenticateWithBindID()}>
                <View style={styles.authenticateButton}>
                    <Text style={styles.authenticateButtonText}>
                        Step-Up
                    </Text>
                </View>
            </TouchableOpacity>
    </View>
    <View>
    <TouchableOpacity onPress={() => this.signTransactionBindID()}>
                <View style={styles.authenticateButton}>
                    <Text style={styles.authenticateButtonText}>
                       Transaction
                    </Text>
                </View>
            </TouchableOpacity>
    </View>
</View>
          
            
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: style.white,
        flex: 1
    },
    brandingLogo: {
        width: '80%',
        resizeMode: "contain",
        alignSelf: "center",
        marginTop: 20
    },
    authenticateButtonContainer: {
        width: '80%',
        alignSelf: 'center',
    },
    authenticateButton: {
        backgroundColor: style.primary,
        justifyContent: 'center',
        height: 50,
        borderRadius: 8,
        margin:16
    },
    authenticateButtonText: {
        color: style.white,
        textAlign: "center",
        fontSize: 20
    },
    errorMessage: {
        width: '80%',
        alignSelf: "center",
        marginTop: 20,
        color: "red"
    }
});