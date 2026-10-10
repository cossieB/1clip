import { describe, expect, it } from "vitest";
import { TOKEN_REGEX } from "../components/PostContent";
import { parseVideoUrl } from "~/components/embeds/IframeFactory";
import { extractFirstVideo, extractTokens } from "./parsePost";

describe('TOKEN_REGEX', () => {
    it('matches hashtags with leading space or start of string', () => {
        const text = '#tag1 some text #TAG2 #broken-tag';
        const matches = [...text.matchAll(TOKEN_REGEX)].map(m => m.groups?.hash).filter(Boolean);
        expect(matches).toEqual(['#tag1', '#TAG2', '#broken']);
    });

    it('matches valid mentions (3 to 15 characters total including @, starting with a letter)', () => {
        const text = '@ab @abc @abcdefghijklmno @abcdefghijklmnop @123';
        const matches = [...text.matchAll(TOKEN_REGEX)].map(m => m.groups?.mention).filter(Boolean);
        // @ab is too short (< 3 chars total), @123 doesn't start with a letter
        expect(matches).toEqual(['@abc', '@abcdefghijklmno']);
    });

    it('matches http and https URLs', () => {
        const text = 'Check http://example.com and https://sub.domain.org/path?query=1';
        const matches = [...text.matchAll(TOKEN_REGEX)].map(m => m.groups?.url).filter(Boolean);
        expect(matches).toEqual([
            'http://example.com',
            'https://sub.domain.org/path?query=1'
        ]);
    });
});

describe('parseVideoUrl', () => {
    describe('Twitch clips', () => {
        it('parses clips.twitch.tv/{slug}', () => {
            const url = new URL('https://clips.twitch.tv/AwkwardToughEmuNonono-12345');
            expect(parseVideoUrl(url)).toEqual(['twitch', 'AwkwardToughEmuNonono-12345']);
        });

        it('returns null for clips.twitch.tv without slug', () => {
            const url = new URL('https://clips.twitch.tv/');
            expect(parseVideoUrl(url)).toBeNull();
        });

        it('parses twitch.tv/{user}/clip/{slug}', () => {
            const url = new URL('https://www.twitch.tv/sodapoppin/clip/AwkwardToughEmuNonono-12345');
            expect(parseVideoUrl(url)).toEqual(['twitch', 'AwkwardToughEmuNonono-12345']);
        });

        it('returns null for twitch.tv without clip path', () => {
            const url = new URL('https://www.twitch.tv/sodapoppin');
            expect(parseVideoUrl(url)).toBeNull();
        });
    });

    describe('YouTube URLs', () => {
        it('parses youtu.be/{ID}', () => {
            const url = new URL('https://youtu.be/dQw4w9WgXcQ');
            expect(parseVideoUrl(url)).toEqual(['youtube', 'dQw4w9WgXcQ']);
        });

        it('returns null for empty youtu.be ID', () => {
            const url = new URL('https://youtu.be/');
            expect(parseVideoUrl(url)).toBeNull();
        });

        it('parses youtube.com/watch?v={ID}', () => {
            const url = new URL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            expect(parseVideoUrl(url)).toEqual(['youtube', 'dQw4w9WgXcQ']);
        });

        it('returns null for youtube.com/watch missing v parameter', () => {
            const url = new URL('https://www.youtube.com/watch?feature=share');
            expect(parseVideoUrl(url)).toBeNull();
        });

        it.each(['shorts', 'live', 'embed', 'v'])(
            'parses youtube.com/%s/{ID}',
            (trigger) => {
                const url = new URL(`https://www.youtube.com/${trigger}/dQw4w9WgXcQ`);
                expect(parseVideoUrl(url)).toEqual(['youtube', 'dQw4w9WgXcQ']);
            }
        );

        it('returns null for youtube.com trigger segments without ID', () => {
            const url = new URL('https://www.youtube.com/shorts/');
            expect(parseVideoUrl(url)).toBeNull();
        });

        it('returns null for unhandled youtube paths', () => {
            const url = new URL('https://www.youtube.com/feed/subscriptions');
            expect(parseVideoUrl(url)).toBeNull();
        });
    });

    describe('Unsupported domains', () => {
        it('returns null for unknown hostnames', () => {
            const url = new URL('https://example.com/watch?v=123');
            expect(parseVideoUrl(url)).toBeNull();
        });
    });
});

describe('extractTokens', () => {
    it('extracts and normalizes unique hashtags, mentions, and the first link', () => {
        const text = 'Hello #Coding and #coding! Shoutout to @john and @jane. Visit https://example.com/page?foo=bar. Also check https://second.com';
        
        const result = extractTokens(text);

        expect(result).toEqual({
            hashtags: ['coding'], // deduplicated and lowercase
            mentions: ['john', 'jane'],
            link: 'https://example.com/page?foo=bar' // picks only the first link
        });
    });

    it('trims punctuation trailing the link', () => {
        const text = 'Check this out: https://example.com/path, and this!';
        const result = extractTokens(text);
        expect(result.link).toBe('https://example.com/path');
    });

    it('returns empty structures and null link when no tokens exist', () => {
        const text = 'Just plain text with no special symbols.';
        const result = extractTokens(text);
        expect(result).toEqual({
            hashtags: [],
            mentions: [],
            link: null
        });
    });
});

describe('extractFirstVideo', () => {
    it('returns the first valid video URL with platform and id', () => {
        const text = 'Watch https://example.com/not-a-video and then https://youtu.be/dQw4w9WgXcQ or https://clips.twitch.tv/TestClip';
        
        const result = extractFirstVideo(text);

        expect(result).toEqual({
            url: 'https://youtu.be/dQw4w9WgXcQ',
            platform: 'youtube',
            id: 'dQw4w9WgXcQ'
        });
    });

    it('handles trailing punctuation correctly in extracted video URL', () => {
        const text = 'Check out https://youtu.be/dQw4w9WgXcQ!';
        const result = extractFirstVideo(text);

        expect(result).toEqual({
            url: 'https://youtu.be/dQw4w9WgXcQ',
            platform: 'youtube',
            id: 'dQw4w9WgXcQ'
        });
    });

    it('returns null if no recognized video URL is present', () => {
        const text = 'Visit https://example.com and @user #tag';
        expect(extractFirstVideo(text)).toBeNull();
    });

    it('ignores malformed URLs gracefully without crashing', () => {
        const text = 'Bad url: https://.../invalid or valid https://youtu.be/dQw4w9WgXcQ';
        const result = extractFirstVideo(text);

        expect(result).toEqual({
            url: 'https://youtu.be/dQw4w9WgXcQ',
            platform: 'youtube',
            id: 'dQw4w9WgXcQ'
        });
    });
});