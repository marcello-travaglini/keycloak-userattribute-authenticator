
package org.keycloak.authentication.authenticators.broker;

import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.jboss.logging.Logger;
import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.AuthenticationFlowError;
import org.keycloak.authentication.AuthenticationFlowException;
import org.keycloak.authentication.authenticators.broker.util.SerializedBrokeredIdentityContext;
import org.keycloak.broker.provider.BrokeredIdentityContext;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

/**
 * @author <a href="mailto:marcello.travaglini@gmail.com">Marcello Travaglini</a>
 */
public class IdpUserAttributeVerificationAuthenticator extends AbstractIdpAuthenticator {

    private static Logger logger = Logger.getLogger(IdpUserAttributeVerificationAuthenticator.class);
    
    @Override
    protected void authenticateImpl(AuthenticationFlowContext context, SerializedBrokeredIdentityContext serializedCtx, BrokeredIdentityContext brokerContext) {
        KeycloakSession session = context.getSession();
        RealmModel realm = context.getRealm();
        
        Map<String, String> config = context.getAuthenticatorConfig().getConfig();
        
        String userAttributeName = config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_USER_ATTRIBUTE_NAME);
        if (userAttributeName == null) {
        	throw new AuthenticationFlowException("The configuration attribute 'User attribute name' is mandatory.", AuthenticationFlowError.INTERNAL_ERROR);
        }
        
        String brokerAttributeName = config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_NAME);
        if (brokerAttributeName == null) {
        	throw new AuthenticationFlowException("The configuration attribute 'Broker Idp attribute name' is mandatory.", AuthenticationFlowError.INTERNAL_ERROR);
        }

        String brokerAttributeValue = optionalTransformAttribute(brokerContext.getUserAttribute(brokerAttributeName), Boolean.parseBoolean(config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_TRANSFORM_TO_UPPER))); 
                
        if (brokerAttributeValue == null) {
        	throw new AuthenticationFlowException("The value of 'Broker Idp attribute' ['" + brokerAttributeName +  "'] is null or empty. Check the attributes mapping of the idp.", AuthenticationFlowError.INTERNAL_ERROR);
        }
        
        Supplier<Stream<UserModel>> userStream = null;
        
        String regExPattern = config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_REGEX);
        if (regExPattern != null && !regExPattern.trim().isEmpty()) {
        	Pattern pattern = Pattern.compile(regExPattern);
        	Matcher matcher = pattern.matcher(brokerAttributeValue);
        	if (matcher.find()) {
                if (config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_REGEX_GROUP_INDEX) != null && !config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_REGEX_GROUP_INDEX).trim().isEmpty()) {
                	int groupIndex = Integer.parseInt(config.get(IdpUserAttributeVerificationAuthenticatorFactory.CONF_BROKER_ATTRIBUTE_REGEX_GROUP_INDEX));
                	userStream = () -> session.users().searchForUserByUserAttributeStream(realm, userAttributeName, matcher.group(groupIndex));
                } else {
                	userStream = () -> session.users().searchForUserByUserAttributeStream(realm, userAttributeName, matcher.group(0));
                }
        	} else {
        		userStream = () -> session.users().searchForUserByUserAttributeStream(realm, userAttributeName, brokerAttributeValue);
        	}
		} else {
			userStream = () -> session.users().searchForUserByUserAttributeStream(realm, userAttributeName, brokerAttributeValue);
		}
                       
        long userCount = userStream.get().count();
        
        if (userCount <= 0) {
        	throw new AuthenticationFlowException("User with attribute[] = '" + brokerAttributeValue + "' not found.", AuthenticationFlowError.INVALID_USER);
        } else if (userCount == 1) {
            Optional<UserModel> existingUser = userStream.get().findFirst();

            logger.debugf("User '%s' confirmed that wants to link with identity provider '%s' . Identity provider username is '%s' ", existingUser.get().getUsername(),
                    brokerContext.getIdpConfig().getAlias(), brokerContext.getUsername());

            context.setUser(existingUser.get());
            context.success();
        } else if (userCount > 1) {
        	throw new AuthenticationFlowException("Too many Users with attribute[] = '" + brokerAttributeValue + "' found.", AuthenticationFlowError.USER_CONFLICT);
        }
    }
    
    private String optionalTransformAttribute(String userAttribute, boolean toUpper) {
    	if (userAttribute != null) {
	        if (toUpper) {
	        	return userAttribute.toUpperCase();
	        } else {
	        	return userAttribute;
	        }
    	} else {
    		return null;
    	}
    }

    @Override
    protected void actionImpl(AuthenticationFlowContext context, SerializedBrokeredIdentityContext serializedCtx, BrokeredIdentityContext brokerContext) {
    	// Not used
    }

    @Override
    public boolean requiresUser() {
        return false;
    }

    @Override
    public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
        return false;
    }

}
