(function (global) {
  'use strict';
  var assets = global.SOULBOX_ASSETS;
  var colours = { Body: '#271020', Heart: '#7F1006', Soul: '#041429', Mind: '#0C2A15' };
  function slug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function currentResult() {
    var quiz = read('quizState') || {}, final = read('finalSubmission') || {};
    return quiz.result || read('soulboxResult') || final.result;
  }
  function whyName(result, display) {
    var value = slug(result.why);
    if (value === 'wonder_and_awe') value = 'wonder';
    if (value === 'catharsis' && display) value = 'controlled_catharsis';
    return 'why_you_read_' + value;
  }
  function resolve(kind, name) {
    var url = assets[kind][name];
    if (!url) throw new Error('Missing ' + kind + ' card: ' + name);
    return { name: name, url: url };
  }
  function downloads(result) {
    var character = result.images && result.images.soulCharacter
      ? result.images.soulCharacter.split('/').pop().replace(/\.(jpg|jpeg|png)$/i, '')
      : 'soulcharacter_' + slug(result.soulCharacter);
    character = character.replace('frankensteins_creature', 'frankenstein');
    return [character, 'story_texture_' + slug(result.texture), whyName(result, false),
      'reading_style_' + slug(result.style), 'pre_house_reveal', 'house_of_' + slug(result.house)]
      .map(function (name) { return resolve('download', name + '.png'); });
  }
  function displayCards(result) {
    return ['story_texture_' + slug(result.texture), whyName(result, true),
      'reading_style_' + slug(result.style), 'pre_house_reveal', 'house_of_' + slug(result.house),
      'gradient_' + slug(result.house)].map(function (name) { return resolve('display', name + '.jpg'); });
  }
  function connectDownload(button, status, fallback, result, onTrigger, shareOnly) {
    var items = downloads(result), files = null, pending = null, objectUrls = [];
    function prepare() {
      if (files) return Promise.resolve(files);
      if (pending) return pending;
      pending = Promise.all(items.map(async function (item) {
        var response = await fetch(item.url);
        if (!response.ok) throw new Error('Unable to load result card');
        var blob = await response.blob();
        return new File([blob], item.name, { type: 'image/png' });
      })).then(function (loaded) { files = loaded; return files; })
        .catch(function (error) { pending = null; throw error; });
      return pending;
    }
    function individualLinks() {
      fallback.replaceChildren();
      files.forEach(function (file, index) {
        var link = document.createElement('a');
        var url = URL.createObjectURL(file); objectUrls.push(url);
        link.href = url; link.download = file.name; link.className = 'individual-card';
        link.textContent = 'Save ' + ['SoulCharacter', 'Story World', 'Why You Read', 'Reading Style', 'Four Houses', 'Your House'][index];
        fallback.appendChild(link);
      });
      fallback.hidden = false;
    }
    function deliver() {
      if (onTrigger) onTrigger();
      if (navigator.share && navigator.canShare && navigator.canShare({ files: files })) {
        // Called directly from a click; awaited downloads would lose activation on mobile.
        button.disabled = true;
        navigator.share({ files: files, title: 'My SoulBox Results' })
          .then(function () { status.textContent = 'Your cards are ready in your chosen app.'; })
          .catch(function (error) {
            if (error.name === 'AbortError') status.textContent = 'Sharing cancelled. Your cards are still here.';
            else { individualLinks(); status.textContent = 'Save your cards individually below.'; }
          }).finally(function () { button.disabled = false; });
      } else {
        individualLinks();
        if (!shareOnly) fallback.querySelectorAll('a').forEach(function (link) { link.click(); });
        status.textContent = 'If your browser blocks multiple downloads, save each card below.';
      }
    }
    button.addEventListener('click', function () {
      if (onTrigger) onTrigger();
      if (files) { deliver(); return; }
      button.disabled = true; status.textContent = 'Preparing your full-quality cards…';
      prepare().then(function () {
        status.textContent = 'Your cards are ready. Tap ' + button.textContent + ' to save or share.';
      }).catch(function () {
        status.textContent = 'We could not load your cards. Check your connection and try again.';
      }).finally(function () { button.disabled = false; });
    });
    window.addEventListener('pagehide', function () { objectUrls.forEach(URL.revokeObjectURL); });
    return { prepare: prepare };
  }
  global.SoulBoxCards = { colours: colours, read: read, write: write, slug: slug,
    currentResult: currentResult, downloads: downloads, displayCards: displayCards, connectDownload: connectDownload };
})(window);
