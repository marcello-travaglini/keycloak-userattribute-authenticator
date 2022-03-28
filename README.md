# keycloak-userattribute-authenticator

Keycloak (https://www.keycloak.org/) authentication based on an idp broker attribute.

## Project details

This custom Idp Authenticator allows you to perform authentication comparing a local user attribute value with an Idp Broker attribute.

## Install

Download `keycloak-userattribute-authenticator.jar` from [Releases page](https://github.com/marcello-travaglini/keycloak-userattribute-authenticator/releases).
Then deploy it into `$KEYCLOAK_HOME/standalone/deployements` directory.

## Setup

In the Keycloak admin UI, select the Authentication config item. In the Flows tab, select First Broker Login and then click Copy. Set the authentication flow name to the desired one.

Find the Handle Existing Account entry and click on the Actions command on the right, then select Add Execution. Choose the provider `Verify Existing Account By Attribute` and click Save.

Set the `Verify Existing Account By Attribute` radio button to Required and remove all unnecessary authentication actions from the flow.

Now it is necessary to configure the action by selecting configure from the right menu.

### Configuration Parameters 

1. `Alias`: enter a name for the authenticator. 

2. `Broker Idp attribute name`: enter the name of Broker Idp attribute.

3. `Optional RegEx pattern`: enter an optional regular expression to filter attribute value.

4. `Optional RegEx matcher group index`: enter an optional index of matcher group. Default is 0.

5. `Transform to Upper Case`:  [ON] Transform Broker Idp attribute value in upper case. [OFF] Leave unchanged.

6. `User attribute name`: enter the name of user attribute to compare with.

Now we have to configure Keycloak to use the newly created authentication flow in the Idps of our interest. On the `Identity Providers` screen, change the identity provider configuration and set the `First Login Flow` parameter to the flow you just created.

## Source Build

Clone this repository and run `mvn clean package`.
You can see `keycloak-userattribute-authenticator.jar` under `target` directory.

## Licence

[Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Author

- [Marcello Travaglini](https://github.com/marcello-travaglini)
