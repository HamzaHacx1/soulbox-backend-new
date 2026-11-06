// SoulBox site-wide tracking (Logic & Data Spec, Section 8).
// - Captures ?ref= on the first page of the session and never overwrites it.
// - Assigns A/B (50/50) once per session.
// - Starts PostHog (EU) with source_ref and ab_variant on every event.
// Safe to include on several pages, or twice on one page.
(function () {
  if (window.SoulBoxTrack) return;
  var POSTHOG_KEY = 'phc_vZ7z2DsaWJ88MzhzF36a35mNWjKvGPrMfFo4FZwQujS6';
  var POSTHOG_HOST = 'https://eu.i.posthog.com';

  function store(kind, key, value) {
    try {
      var s = window[kind];
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (_) {}
    return value === undefined ? null : value;
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }

  var ref = null;
  try { ref = new URLSearchParams(location.search).get('ref'); } catch (_) {}
  if (ref && ref.trim() && !store('sessionStorage', 'soulbox_ref')) store('sessionStorage', 'soulbox_ref', ref.trim().slice(0, 100));
  var sourceRef = store('sessionStorage', 'soulbox_ref') || null;

  var ab = store('sessionStorage', 'soulbox_ab');
  if (ab !== 'A' && ab !== 'B') ab = store('sessionStorage', 'soulbox_ab', Math.random() < 0.5 ? 'A' : 'B');

  // One stable id per browser, shared with PostHog and saved on Gifts/Readers rows.
  var visitorId = store('localStorage', 'soulbox_visitor_id');
  if (!visitorId) visitorId = store('localStorage', 'soulbox_visitor_id', uuid());

  /* PostHog loader (official snippet) */
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags on onFeatureFlags onSessionId identify setPersonProperties group resetGroups reset get_distinct_id get_session_id alias set_config opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    bootstrap: { distinctID: visitorId },
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
    person_profiles: 'identified_only'
  });
  posthog.register({ source_ref: sourceRef, ab_variant: ab });

  function capture(event, props) {
    try { posthog.capture(event, props || {}); } catch (_) {}
  }

  window.SoulBoxTrack = {
    sourceRef: sourceRef,
    abVariant: ab,
    visitorId: visitorId,
    // Choose A/B content: SoulBoxTrack.variant({ A: 'Headline one', B: 'Headline two' })
    variant: function (options) { return options && (ab in options) ? options[ab] : options && options.A; },
    register: function (props) { try { posthog.register(props); } catch (_) {} },
    screenView: function (screen, props) { capture('screen_view', Object.assign({ event_type: 'screen_view', screen_name: screen }, props)); },
    screenComplete: function (screen, props) { capture('screen_complete', Object.assign({ event_type: 'screen_complete', screen_name: screen }, props)); },
    milestone: function (name, props) { capture(name, Object.assign({ event_type: 'milestone', milestone_name: name }, props)); }
  };
})();
