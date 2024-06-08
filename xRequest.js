const axios = require('axios');
require('dotenv').config()

const { AUTHORIZATION, COOKIE, XCSRFTOKEN, GRAPHQL, MAXTWEETS } = process.env;
const variables = { "count": 20 }
const features = {
    "rweb_tipjar_consumption_enabled": true,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "verified_phone_label_enabled": false,
    "creator_subscriptions_tweet_preview_api_enabled": true,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "communities_web_enable_tweet_community_results_fetch": true,
    "c9s_tweet_anatomy_moderator_badge_enabled": true,
    "articles_preview_enabled": true,
    "tweetypie_unmention_optimization_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "view_counts_everywhere_api_enabled": true,
    "longform_notetweets_consumption_enabled": true,
    "responsive_web_twitter_article_tweet_consumption_enabled": true,
    "tweet_awards_web_tipping_enabled": false,
    "creator_subscriptions_quote_tweet_preview_enabled": false,
    "freedom_of_speech_not_reach_fetch_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
    "rweb_video_timestamps_enabled": true,
    "longform_notetweets_rich_text_read_enabled": true,
    "longform_notetweets_inline_media_enabled": true,
    "responsive_web_enhance_cards_enabled": false
}

module.exports = (id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://x.com/i/api/graphql/${GRAPHQL}/ListLatestTweetsTimeline?variables=${encodeURIComponent(JSON.stringify({ ...variables, listId: id }))}&features=${encodeURIComponent(JSON.stringify(features))}`,
        headers: {
            'authorization': `${AUTHORIZATION}`,
            'cookie': `${COOKIE}`,
            'x-csrf-token': `${XCSRFTOKEN}`,
        }
    };
    return new Promise((res, rej) => {
        axios.request(config)
            .then(({data}) => {
                if(data?.data?.errors) rej(response.data.data.errors)
                else {
                    let tweets = []
                    let entries = data.data.list.tweets_timeline.timeline.instructions[0].entries
                    for (let i = 0; i < entries.length && tweets.length <= MAXTWEETS; i++) {
                        const entry = entries[i];
                        if(entry.content.entryType === "TimelineTimelineModule" || entry.content.entryType === "TimelineTimelineCursor") continue 
                        let result = entry.content.itemContent.tweet_results.result
                        let tweet = result.legacy? result: result.tweet;
                        let media = tweet.legacy.entities.media
                        tweets.push({
                            text: tweet.legacy.full_text,
                            media: media && media.length>0? media.map((_media) => _media.media_url_https):[],
                            date: tweet.legacy.created_at,
                            author: tweet.core.user_results.result.legacy.screen_name,
                            author_name: tweet.core.user_results.result.legacy.name,
                            avatar: tweet.core.user_results.result.legacy.profile_image_url_https
                        }) 
                    }
                    res(tweets.filter((e) => e !== undefined))
                }
            })
            .catch((error) => {
                rej(error);
            });
    })


}