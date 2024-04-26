import ElasticEmail from '@elasticemail/elasticemail-client';

import 'dotenv/config';

const {ELASTICEMAIL_API_KEY, ELASTICEMAIL_EMAIL_FROM, WEBSITE_URL} = process.env;
 
const defaultClient = ElasticEmail.ApiClient.instance;
 
const {apikey} = defaultClient.authentications;
apikey.apiKey = ELASTICEMAIL_API_KEY;
 
const api = new ElasticEmail.EmailsApi()
 
export const emailCallback = function(newUser, verificationToken) {

    const email = ElasticEmail.EmailMessageData.constructFromObject({
        Recipients: [
            new ElasticEmail.EmailRecipient("fasito7845@togito.com")
        ],
        Content: {
            Body: [
                ElasticEmail.BodyPart.constructFromObject({
                    ContentType: "HTML",
                    Content: `<a href="${WEBSITE_URL}/api/users/verify/${verificationToken}">Please click here to verify your Email</a>`
                })
            ],
            Subject: "Verification",
            From: ELASTICEMAIL_EMAIL_FROM,
        }
    });

    api.emailsPost(email, (error) => {
        if (error) {
            console.error(error);
            console.log(email)
        } else {
            console.log('Email sent successfully.');
            console.log(email)
        }
    });
};

//The message is not sent, even though everything seems to be working perfectly fine
