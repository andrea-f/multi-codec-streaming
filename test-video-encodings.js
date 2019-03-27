var CODEC = {
    H264: 'H264',
    H265: 'H265',
    VP9: 'VP9'
};

var BROWSER = {
    CHROME: "Chrome",
    FIREFOX: "Firefox",
    SAFARI: "Version",
    EDGE: "Edge",
    IE: "Trident",
    // HEVC support: https://caniuse.com/#feat=hevc
    CHROME_VERSION: 60,
    FIREFOX_VERSION: 26,
    SAFARI_VERSION: 13,
    IE_VERSION: 7,
    EDGE_VERSION: 11
};

var player = null;

// Updates UI elements after information have been retrieved.
function updateUI (browser, codec, media) {
    document.getElementById('codec').innerHTML = codec;
    document.getElementById('browser').innerHTML = browser;
    document.getElementById('media').innerHTML = media;
}

// Returns the current user browser and version
function getBrowser () {
    var 
        userAgent = navigator.userAgent,
        detectedBrowserVersion = -1,
        detectedBrowser;

    for (key in BROWSER) {
        if (userAgent.indexOf(BROWSER[key]) != -1) {
            detectedBrowser = BROWSER[key];
            try {
                // Only retrieve the first 2 version numbers if it exists from the user agent string.
                detectedBrowserVersion = parseInt(userAgent.substr(userAgent.indexOf(detectedBrowser + '/') + detectedBrowser.length + 1, 2).replace('.', ''));
            } catch (err) {
                console.log("Browser version not detected", err);
            }
            break;
        }
    }
    return {
        browser: detectedBrowser,
        version: detectedBrowserVersion
    }
}

// Bitmovin player config
function loadBitmovinPlayerWithConfig () {
    var 
        browserInfo = getBrowser(),
        browser = browserInfo.browser,
        version = browserInfo.version,
        // Bitmovin player config
        config = {
            key: 'a57fbebb-c05b-489a-b862-d926b43b45bc',
            analytics: {
                key: 'f8ccc531-21a7-49d9-b687-c6238c7bb9ad',
                videoId: 'test-video-encodings'
            },
            playback: {
                muted: true
            },
            events: {
                play: function () {
                    console.log("Playing video.");
                },
                stallstarted: function () {
                    console.log("Video stalled started.");
                },
                stallended: function () {
                    console.log("Video stalled ended, can play.");
                },
                paused: function () {
                    console.log("Video paused.");
                },
                playbackfinished: function () {
                    console.log("Video ended.");
                }
            }
        },
        media = {},
        selectedCodec = CODEC.H264; // Defaults to h264

    // Detect current browser capabilities and set media data.
    if ((browser === BROWSER.CHROME && version >= BROWSER.CHROME_VERSION) || (browser === BROWSER.FIREFOX && version >= BROWSER.FIREFOX_VERSION)) {
        selectedCodec = CODEC.VP9;
        media.dash = 'https://bitmovin-a.akamaihd.net/content/multi-codec/vp9/stream.mpd';
    } else if (browser === BROWSER.EDGE && version >= BROWSER.EDGE_VERSION) {
        selectedCodec = CODEC.H265;
        media.dash = 'https://bitmovin-a.akamaihd.net/content/multi-codec/hevc/stream.mpd';
    } else if (browser === BROWSER.SAFARI) {
        if (version >= BROWSER.SAFARI_VERSION) {
            selectedCodec = CODEC.H265;
            media.hls = 'https://bitmovin-a.akamaihd.net/webpages/demos/content/multi-codec/hevc/stream_fmp4.m3u8';
        } else {
            media.hls = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';
        }
        // Replace Version string with Safari.
        browser = 'Safari';
    } else if (browser === BROWSER.IE && version >= BROWSER.IE_VERSION) {
        selectedCodec = CODEC.H265;
        media.dash = 'https://bitmovin-a.akamaihd.net/content/multi-codec/hevc/stream.mpd';
    } else {
        media.dash = 'https://bitmovin-a.akamaihd.net/content/multi-codec/h264/stream.mpd';
    }

    // Create the bitmovin module and instantiate it
    var playerContainer = document.getElementById('player');
    bitmovin.player.Player.addModule(bitmovin.analytics.PlayerModule);
    player = new bitmovin.player.Player(playerContainer, config);

    // Load bitmovin player 
    player.load(media).then(function () {
        player.preload();
    });
    
    // Update the UI
    updateUI(browser + ', v' + version, selectedCodec, (media.dash !== undefined) ? media.dash : media.hls);
};

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", function (event) {
    loadBitmovinPlayerWithConfig();
});