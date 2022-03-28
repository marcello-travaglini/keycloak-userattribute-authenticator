package org.keycloak.authentication.authenticators.broker;

import java.util.Arrays;
import java.util.List;

import org.keycloak.Config;
import org.keycloak.authentication.Authenticator;
import org.keycloak.authentication.AuthenticatorFactory;
import org.keycloak.models.AuthenticationExecutionModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.KeycloakSessionFactory;
import org.keycloak.provider.ProviderConfigProperty;

/**
 * @author <a href="mailto:marcello.travaglini@gmail.com">Marcello Travaglini</a>
 */
public class IdpUserAttributeVerificationAuthenticatorFactory implements AuthenticatorFactory {

    public static final String PROVIDER_ID = "idp-attribute-verification";
    
    public static final String CONF_BROKER_ATTRIBUTE_NAME = "broker_attribute_name";
    public static final String CONF_BROKER_ATTRIBUTE_REGEX = "broker_attribute_regex";
    public static final String CONF_BROKER_ATTRIBUTE_REGEX_GROUP_INDEX = "broker_attribute_regex_group_index";
    public static final String CONF_BROKER_ATTRIBUTE_TRANSFORM_TO_UPPER = "broker_attribute_transform_to_upper";
    public static final String CONF_USER_ATTRIBUTE_NAME = "user_attribute_name";
    public static final String CONF_USER_ATTRIBUTE_SYNCH = "user_attribute_synch";

    static IdpUserAttributeVerificationAuthenticator SINGLETON = new IdpUserAttributeVerificationAuthenticator();

	@Override
    public Authenticator create(KeycloakSession session) {
        return SINGLETON;
    }

    @Override
    public void init(Config.Scope config) {

    }

    @Override
    public void postInit(KeycloakSessionFactory factory) {

    }

    @Override
    public void close() {

    }

    @Override
    public String getId() {
        return PROVIDER_ID;
    }

    @Override
    public String getReferenceCategory() {
        return "attributeVerification";
    }

    @Override
    public boolean isConfigurable() {
        return true;
    }

    @Override
    public AuthenticationExecutionModel.Requirement[] getRequirementChoices() {
        return REQUIREMENT_CHOICES;
    }

    @Override
    public String getDisplayType() {
        return "Verify existing account by Attribute";
    }

    @Override
    public String getHelpText() {
        return "Search existing Keycloak user by attribute, that wants to link his user account with identity provider";
    }

    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        ProviderConfigProperty brokerAttribute = new ProviderConfigProperty();
        brokerAttribute.setType(ProviderConfigProperty.STRING_TYPE);
        brokerAttribute.setName(CONF_BROKER_ATTRIBUTE_NAME);
        brokerAttribute.setLabel("Broker Idp attribute name");
        brokerAttribute.setHelpText("Name of the attribute to check");
        
        ProviderConfigProperty brokerAttributeRegex = new ProviderConfigProperty();
        brokerAttributeRegex.setType(ProviderConfigProperty.STRING_TYPE);
        brokerAttributeRegex.setName(CONF_BROKER_ATTRIBUTE_REGEX);
        brokerAttributeRegex.setLabel("Optional RegEx pattern");
        brokerAttributeRegex.setHelpText("RegEx pattern to filter Broker Idp attribute value");

        ProviderConfigProperty brokerAttributeRegexGroupIndex = new ProviderConfigProperty();
        brokerAttributeRegexGroupIndex.setType(ProviderConfigProperty.STRING_TYPE);
        brokerAttributeRegexGroupIndex.setName(CONF_BROKER_ATTRIBUTE_REGEX_GROUP_INDEX);
        brokerAttributeRegexGroupIndex.setLabel("Optional RegEx matcher group index");
        brokerAttributeRegexGroupIndex.setHelpText("Optional RegEx matcher group index");
        
        ProviderConfigProperty brokerAttributeTransformToUpper = new ProviderConfigProperty();
        brokerAttributeTransformToUpper.setType(ProviderConfigProperty.BOOLEAN_TYPE);
        brokerAttributeTransformToUpper.setName(CONF_BROKER_ATTRIBUTE_TRANSFORM_TO_UPPER);
        brokerAttributeTransformToUpper.setLabel("Transform to Upper Case");
        brokerAttributeTransformToUpper.setHelpText("Transform Broker Idp attribute value to Upper Case");
        
        ProviderConfigProperty userAttribute = new ProviderConfigProperty();
        userAttribute.setType(ProviderConfigProperty.STRING_TYPE);
        userAttribute.setName(CONF_USER_ATTRIBUTE_NAME);
        userAttribute.setLabel("User attribute name");
        userAttribute.setHelpText("Name of the attribute to compare");

        return Arrays.asList(brokerAttribute, brokerAttributeRegex, brokerAttributeRegexGroupIndex, brokerAttributeTransformToUpper, userAttribute);
    }

    @Override
    public boolean isUserSetupAllowed() {
        return false;
    }
}
