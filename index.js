#!/usr/bin/env node
import clipboard from 'clipboardy';
import ky from 'ky';
import { serve } from 'micro';
import open from 'open';
import ora from 'ora';
import prompts from 'prompts';
import { v4 as uuid } from 'uuid';
import yargs from 'yargs/yargs';

import http from 'node:http';

const scopes = [
  {
    description:
      'View analytics data for the Twitch Extensions owned by the authenticated account.Get Extension Analytics',
    name: 'analytics:read:extensions',
  },
  {
    description:
      'View analytics data for the games owned by the authenticated account.Get Game Analytics',
    name: 'analytics:read:games',
  },
  {
    description: 'View Bits information for a channel.Get Bits Leaderboard',
    name: 'bits:read',
  },
  {
    description: 'Manage ads schedule on a channel.Snooze Next Ad',
    name: 'channel:manage:ads',
  },
  {
    description: 'Read the ads schedule and details on your channel.Get Ad Schedule',
    name: 'channel:read:ads',
  },
  {
    description:
      'Manage a channel’s broadcast configuration, including updating channel configuration and managing stream markers and stream tags.Modify Channel InformationCreate Stream MarkerReplace Stream Tags',
    name: 'channel:manage:broadcast',
  },
  {
    description:
      'Read charity campaign details and user donations on your channel.Get Charity Campaign',
    name: 'channel:read:charity',
  },
  {
    description: 'Run commercials on a channel.Start Commercial',
    name: 'channel:edit:commercial',
  },
  {
    description: 'View a list of users with the editor role for a channel.Get Channel Editors',
    name: 'channel:read:editors',
  },
  {
    description:
      'Manage a channel’s Extension configuration, including activating Extensions.Get User Active ExtensionsUpdate User Extensions',
    name: 'channel:manage:extensions',
  },
  {
    description: 'View Creator Goals for a channel.Get Creator Goals',
    name: 'channel:read:goals',
  },
  {
    description:
      'Read Guest Star details for your channel.Get Channel Guest Star SettingsGet Guest Star SessionGet Guest Star Invites',
    name: 'channel:read:guest_star',
  },
  {
    description:
      'Manage Guest Star for your channel.Update Channel Guest Star SettingsCreate Guest Star SessionEnd Guest Star SessionSend Guest Star InviteDelete Guest Star InviteAssign Guest Star SlotUpdate Guest Star SlotDelete Guest Star SlotUpdate Guest Star Slot Settings',
    name: 'channel:manage:guest_star',
  },
  {
    description: 'View Hype Train information for a channel.Get Hype Train Events',
    name: 'channel:read:hype_train',
  },
  {
    description:
      'Add or remove the moderator role from users in your channel.Add Channel ModeratorRemove Channel Moderator',
    name: 'channel:manage:moderators',
  },
  {
    description: 'View a channel’s polls.Get Polls',
    name: 'channel:read:polls',
  },
  {
    description: 'Manage a channel’s polls.Create PollEnd Poll',
    name: 'channel:manage:polls',
  },
  {
    description: 'View a channel’s Channel Points Predictions.Get Channel Points Predictions',
    name: 'channel:read:predictions',
  },
  {
    description:
      'Manage of channel’s Channel Points PredictionsCreate Channel Points PredictionEnd Channel Points Prediction',
    name: 'channel:manage:predictions',
  },
  {
    description: 'Manage a channel raiding another channel.Start a raidCancel a raid',
    name: 'channel:manage:raids',
  },
  {
    description:
      'View Channel Points custom rewards and their redemptions on a channel.Get Custom RewardGet Custom Reward Redemption',
    name: 'channel:read:redemptions',
  },
  {
    description:
      'Manage Channel Points custom rewards and their redemptions on a channel.Create Custom RewardsDelete Custom RewardUpdate Custom RewardUpdate Redemption Status',
    name: 'channel:manage:redemptions',
  },
  {
    description:
      'Manage a channel’s stream schedule.Update Channel Stream ScheduleCreate Channel Stream Schedule SegmentUpdate Channel Stream Schedule SegmentDelete Channel Stream Schedule Segment',
    name: 'channel:manage:schedule',
  },
  {
    description: 'View an authorized user’s stream key.Get Stream Key',
    name: 'channel:read:stream_key',
  },
  {
    description:
      'View a list of all subscribers to a channel and check if a user is subscribed to a channel.Get Broadcaster Subscriptions',
    name: 'channel:read:subscriptions',
  },
  {
    description: 'Manage a channel’s videos, including deleting videos.Delete Videos',
    name: 'channel:manage:videos',
  },
  {
    description: 'Read the list of VIPs in your channel.Get VIPs',
    name: 'channel:read:vips',
  },
  {
    description:
      'Add or remove the VIP role from users in your channel.Get VIPsAdd Channel VIPRemove Channel VIP',
    name: 'channel:manage:vips',
  },
  {
    description: 'Manage Clips for a channel.Create Clip',
    name: 'clips:edit',
  },
  {
    description:
      'View a channel’s moderation data including Moderators, Bans, Timeouts, and Automod settings.Check AutoMod StatusGet Banned UsersGet Moderators',
    name: 'moderation:read',
  },
  {
    description:
      'Send announcements in channels where you have the moderator role.Send Chat Announcement',
    name: 'moderator:manage:announcements',
  },
  {
    description:
      'Manage messages held for review by AutoMod in channels where you are a moderator.Manage Held AutoMod Messages',
    name: 'moderator:manage:automod',
  },
  {
    description: 'View a broadcaster’s AutoMod settings.Get AutoMod Settings',
    name: 'moderator:read:automod_settings',
  },
  {
    description: 'Manage a broadcaster’s AutoMod settings.Update AutoMod Settings',
    name: 'moderator:manage:automod_settings',
  },
  {
    description: 'Ban and unban users.Ban usersUnban user',
    name: 'moderator:manage:banned_users',
  },
  {
    description: 'View a broadcaster’s list of blocked terms.Get Blocked Terms',
    name: 'moderator:read:blocked_terms',
  },
  {
    description: 'Manage a broadcaster’s list of blocked terms.Add Blocked TermRemove Blocked Term',
    name: 'moderator:manage:blocked_terms',
  },
  {
    description:
      'Delete chat messages in channels where you have the moderator roleDelete Chat Messages',
    name: 'moderator:manage:chat_messages',
  },
  {
    description: 'View a broadcaster’s chat room settings.Get Chat Settings',
    name: 'moderator:read:chat_settings',
  },
  {
    description: 'Manage a broadcaster’s chat room settings.Update Chat Settings',
    name: 'moderator:manage:chat_settings',
  },
  {
    description: 'View the chatters in a broadcaster’s chat room.Get Chatters',
    name: 'moderator:read:chatters',
  },
  {
    description: 'Read the followers of a broadcaster.Get Channel Followers',
    name: 'moderator:read:followers',
  },
  {
    description:
      'Read Guest Star details for channels where you are a Guest Star moderator.Get Channel Guest Star SettingsGet Guest Star SessionGet Guest Star Invites',
    name: 'moderator:read:guest_star',
  },
  {
    description:
      'Manage Guest Star for channels where you are a Guest Star moderator.Send Guest Star InviteDelete Guest Star InviteAssign Guest Star SlotUpdate Guest Star SlotDelete Guest Star SlotUpdate Guest Star Slot Settings',
    name: 'moderator:manage:guest_star',
  },
  {
    description: 'View a broadcaster’s Shield Mode status.Get Shield Mode Status',
    name: 'moderator:read:shield_mode',
  },
  {
    description: 'Manage a broadcaster’s Shield Mode status.Update Shield Mode Status',
    name: 'moderator:manage:shield_mode',
  },
  {
    description: 'View a broadcaster’s shoutouts.',
    name: 'moderator:read:shoutouts',
  },
  {
    description: 'Manage a broadcaster’s shoutouts.Send a Shoutout',
    name: 'moderator:manage:shoutouts',
  },
  {
    description: 'View a broadcaster’s unban requests.Get Unban Requests',
    name: 'moderator:read:unban_requests',
  },
  {
    description: 'Manage a broadcaster’s unban requests.Resolve Unban Requests',
    name: 'moderator:manage:unban_requests',
  },
  {
    description: 'Manage a user object.Update User',
    name: 'user:edit',
  },
  {
    description:
      'Deprecated. Was previously used for “Create User Follows” and “Delete User Follows.” See Deprecation of Create and Delete Follows API Endpoints.',
    name: 'user:edit:follows',
  },
  {
    description: 'View the block list of a user.Get User Block List',
    name: 'user:read:blocked_users',
  },
  {
    description: 'Manage the block list of a user.Block UserUnblock User',
    name: 'user:manage:blocked_users',
  },
  {
    description:
      'View a user’s broadcasting configuration, including Extension configurations.Get Stream MarkersGet User ExtensionsGet User Active Extensions',
    name: 'user:read:broadcast',
  },
  {
    description: 'Update the color used for the user’s name in chat.Update User Chat Color',
    name: 'user:manage:chat_color',
  },
  {
    description: 'View a user’s email address.Get Users (optional)',
    name: 'user:read:email',
  },
  {
    description: 'View emotes available to a userGet User Emotes',
    name: 'user:read:emotes',
  },
  {
    description:
      'View the list of channels a user follows.Get Followed ChannelsGet Followed Streams',
    name: 'user:read:follows',
  },
  {
    description:
      'Read the list of channels you have moderator privileges in.Get Moderated Channels',
    name: 'user:read:moderated_channels',
  },
  {
    description:
      'View if an authorized user is subscribed to specific channels.Check User Subscription',
    name: 'user:read:subscriptions',
  },
  {
    description:
      'Read whispers that you send and receive, and send whispers on your behalf.Send Whisper',
    name: 'user:manage:whispers',
  },
  {
    description: 'Allows the client’s bot users access to a channel.',
    name: 'channel:bot',
  },
  {
    description:
      'Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.',
    name: 'channel:moderate',
  },
  {
    description: 'Send live stream chat messages using an IRC connection.',
    name: 'chat:edit',
  },
  {
    description: 'View live stream chat messages using an IRC connection.',
    name: 'chat:read',
  },
  {
    description: 'Allows client’s bot to act as this user.',
    name: 'user:bot',
  },
  {
    description: 'View live stream chat and room messages using EventSub.',
    name: 'user:read:chat',
  },
  {
    description: 'Send live stream chat messages using Send Chat Message API.',
    name: 'user:write:chat',
  },
  {
    description: 'View your whisper messages.',
    name: 'whispers:read',
  },
  {
    description: 'Send whisper messages.',
    name: 'whispers:edit',
  },
];
// See https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow

// Setup the spinner
const spinner = ora();

const trim = (value) => value?.trim();
const required =
  (message = 'This field is required') =>
  (value) =>
    !value?.length ? message : true;

const { clientId: defaultClientId, clientSecret: defaultClientSecret } = yargs(
  process.argv.slice(2),
).parse();
prompts.override({ clientId: defaultClientId, clientSecret: defaultClientSecret });

console.log('Welcome to Twitch Token Generator.');
console.log(
  'First, make sure you have created a twitch app: https://dev.twitch.tv/console/apps/create',
);
console.log('The application must meet the following requirements:');
console.log('- OAuth Redirect URLs: http://localhost:3465/authorize');
console.log('- Client Type: Confidential');
console.log('- Make sure to create a Client Secret (it will be necessary for the next step)');
console.log('');
console.log('The OAuth redirect url will allow this CLI to catch OAuth responses and gi');

// First, we need to ask app details
const { clientId, clientSecret, appScopes, isOk } = await prompts([
  {
    type: 'confirm',
    message: 'Are the steps above ok?',
    name: 'isOk',
  },
  {
    type: (_, { isOk }) => (isOk ? 'text' : null),
    name: 'clientId',
    format: trim,
    validate: required(),
    message: 'What is your app client_id?',
  },
  {
    type: (_, { isOk }) => (isOk ? 'invisible' : null),
    name: 'clientSecret',
    format: trim,
    validate: required(),
    message: 'What is your app client_secret?',
  },
  {
    type: (_, { isOk }) => (isOk ? 'autocompleteMultiselect' : null),
    name: 'appScopes',
    message: 'Select desired scopes to use for your app',
    format: (value) => value.join(' '),
    min: 1,
    choices: scopes.map((scope) => ({
      title: scope.name,
      value: scope.name,
    })),
  },
]);

// Force quit if setup is not ok
if (!isOk) {
  process.exit(-1);
}

const getOAuthToken = async (code) => {
  spinner.start('Generating oauth token...');

  try {
    const { access_token } = await ky
      .post('https://id.twitch.tv/oauth2/token', {
        searchParams: {
          client_id: encodeURIComponent(clientId),
          client_secret: encodeURIComponent(clientSecret),
          code,
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:3465/authorize',
        },
      })
      .json();

    clipboard.writeSync(access_token);
    spinner.succeed('OAuth token generated, it as been copied into your clipboard.');
  } catch (error) {
    spinner.fail('Unable to get oauth token');
    console.log({ error, response: error.response.body, request: error.request });
  } finally {
    closeServer();
  }
};

spinner.start('Authorizing your app...');

const sessionId = uuid();

// Flag used to know if the code server request is already processed or not
let hasCode = false;

// Starting server to catch oauth response locally
const server = new http.Server(
  serve(async (req, res) => {
    // On ignore toutes les requêtes pour lesquelles on n'a pas besoin de récupérer des infos
    if (!req.url.startsWith('/authorize')) {
      return 'ok';
    }

    const parsedUrl = new URL(`http://localhost:3465${req.url}`);
    const code = parsedUrl.searchParams.get('code');
    const state = parsedUrl.searchParams.get('state');
    const error = parsedUrl.searchParams.get('error');
    const errorDescription = parsedUrl.searchParams.get('error_description');
    if (hasCode) {
      return 'ok'; // If the code is already handled, ignore all requests
    }

    if (error || errorDescription) {
      spinner.fail('Something goes wrong');
      console.log('Error code:', error);
      console.log('Error message:', errorDescription);
      process.exitCode = -2;
      process.emit('SIGINT');
      return 'nok';
    }

    if (!code || !state || sessionId !== state) {
      spinner.fail('Unable to get the authorization code.', req.url);
      process.exitCode = -1;
      process.emit('SIGINT');
      return 'Unable to get the authorization code.';
    }

    spinner.succeed('Got authorization code');
    hasCode = true;
    getOAuthToken(code);
    return 'You can close this tab and go back to the CLI';
  }),
);

const closeServer = (cb = () => {}) => {
  setTimeout(() => server.close(cb));
};

server.listen(3465);

server.on('listening', async () => {
  const queryParams = new URLSearchParams({
    response_type: 'code',
    grant_type: 'authorization_code',
    client_id: encodeURIComponent(clientId),
    client_secret: encodeURIComponent(clientSecret),
    scopes: encodeURIComponent(appScopes),
    redirect_uri: 'http://localhost:3465/authorize', // Custom server started earlier to catch response code,
    state: sessionId,
  });

  await open(`https://id.twitch.tv/oauth2/authorize?${queryParams.toString()}`);
});

// Handle shutdown gracefully
if (process.platform === 'win32') {
  var rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', function () {
    process.emit('SIGINT');
  });
}

process.on('SIGINT', function () {
  closeServer(() => {
    spinner.stop();
    process.exit();
  });
});
