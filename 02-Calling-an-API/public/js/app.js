// The Auth0 client, initialized in configureClient()
let auth0 = null;

/**
 * Starts the authentication flow
 */
async function login(targetUrl) {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      redirect_uri: window.location.origin
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
}

/**
 * Executes the logout flow
 */
const logout = () => {
  try {
    console.log("Logging out");
    auth0.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience
  });
};
/**
 * This is for the new call for applications
 */


/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

/** Check if user is manager */
export async function onExecutePostLogin(event, api, authorization) {
  if(authorization.roles === 'Manager')
  console.log('This user is a manager');
  else console.log('This user is not a Manager')
}

/**
 * Calls the API endpoint with an authorization token
 */
async function callApi() {
  try {
    const token = await auth0.getTokenSilently();

    const response = await fetch("/api/external", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const responseData = await response.json();
    const responseElement = document.getElementById("api-call-result");

    responseElement.innerText = JSON.stringify(responseData, {}, 2);

    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
    console.log(response);

    eachElement(".result-block", (c) => c.classList.add("show"));
  } catch (e) {
    console.error(e);
  }
}
//   async function callApi1() {
//   try {
//     const token = await auth0.getTokenSilently();

//     const response = await fetch("/api/external", {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     const responseData = await response.json();
//     const responseElement = document.getElementById("api-call-result");

//     responseElement.innerText = JSON.stringify(responseData, {}, 2);

//     document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
//     console.log(response);

//     eachElement(".result-block", (c) => c.classList.add("show"));
//   } catch (e) {
//     console.error(e);
//   }
// }

//  async function callApi2() {
//   try {
//     const token = await auth0.getTokenSilently();

//     const response = await fetch("/api/external", {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     const responseData = await response.json();
//     const responseElement = document.getElementById("api-call-result");

//     responseElement.innerText = JSON.stringify(responseData, {}, 2);

//     document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
//     console.log(response);

//     eachElement(".result-block", (c) => c.classList.add("show"));
//   } catch (e) {
//     console.error(e);
//   }
// }


// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentFromUrl(window.location.pathname)) {
    showContentFromUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  const bodyElement = document.getElementsByTagName("body")[0];

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  bodyElement.addEventListener("click", (e) => {
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");

      if (showContentFromUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    } else if (e.target.getAttribute("id") === "call-api") {
      e.preventDefault();
      callApi();
    }
  });

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0.handleRedirectCallback();

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};

//with async/await
// document.getElementById('call-api').addEventListener('click', async () => {
//   const accessToken = await auth0.getTokenSilently();
//   const result = await fetch('https://dev-kad4txwg.us.auth0.com/api/v2/clients?fields=tenant%2Cname&include_fields=true&include_totals=true', {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${accessToken}`
//     }
//   });
//   const data = await result.json();
//   console.log(data);
// });

document.getElementById('pingAPI').addEventListener('click', () => {
  console.log("Ping API Call Fired")
  auth0
    .getTokenSilently()
    .then(accessToken =>
      fetch('/Users/tiana/JS-Tech/auth0-javascript-tech-exercise/02-Calling-an-API/welcome.html', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});

//with promises
document.getElementById('call-api').addEventListener('click', () => {
  console.log("API Call Fired")
  auth0
    .getTokenSilently()
    .then(accessToken =>
      fetch('/Users/tiana/JS-Tech/auth0-javascript-tech-exercise/02-Calling-an-API/welcome.html', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});


document.getElementById('call-api-1').addEventListener('click', () => {
  console.log("API Call Fired")
  auth0
     .getTokenSilently()
    .then(accessToken =>
      fetch('https://dev-kad4txwg.us.auth0.com/api/v2/clients?fields=tenant%2Cname&include_fields=true&include_totals=true', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});

document.getElementById('call-api-2').addEventListener('click', () => {
  console.log("API Call Fired")
  auth0
    .getTokenSilently()
    .then(accessToken =>
      fetch('https://dev-kad4txwg.us.auth0.com/api/v2/actions/actions?triggerId=post-login&deployed=true', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});

document.getElementById('call-api-3').addEventListener('click', () => {
  console.log("API Call Fired")
  auth0
    .getTokenSilently()
    .then(accessToken =>
      fetch('https://dev-kad4txwg.us.auth0.com/api/v2/actions/actions?triggerId=post-login&deployed=true', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    )
    .then(result => result.json())
    .then(data => {
      console.log(data);
    });
});
