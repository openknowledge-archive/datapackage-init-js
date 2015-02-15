jQuery(document).ready(function($) {
  var $form = $('.js-dp')
    , dp = {}
    ;

  initializeLicenseOptions(licenseOptions);

  $form.on('submit', function(e) {
    e.preventDefault();
    onChangeForm($form, dp);
  });
  $form.on("change", ":input", function() {
    onChangeForm($form, dp);
  });
  
  // HTML5 support checks
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
});

function onChangeForm($form, dp) {
  var vals = dictify($form.serializeArray());
  // have to add in file objects as they are not found by serialize array
  var files = $form.find('input[type="file"]').get(0).files;
  vals['files'] = files;

  updateDataPackageJson(dp, vals, function(err, newDp) {
    dp = newDp;
    // updateFormFromDataPackage(dp);
    $('.js-dpjson').val(JSON.stringify(dp, null, 2));
  });
}

// convert form array to dict
function dictify(serializedFormArray) {
  var o = {};
  $.each(serializedFormArray, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
}

parseQueryString = function(q) {
  if (!q) {
    return {};
  }
  var urlParams = {},
    e, d = function (s) {
      return decodeURIComponent(s.replace(/\+/g, " "));
    },
    r = /([^&=]+)=?([^&]*)/g;

  if (q && q.length && q[0] === '?') q = q.slice(1);
  while (e = r.exec(q)) {
    // TODO: have values be array as query string allow repetition of keys
    urlParams[d(e[1])] = d(e[2]);
  }
  return urlParams;
};

function initializeLicenseOptions(licenseOptions) {
  var $licenseSelect = $('select[name="license"]')
    , optionsFragment = document.createDocumentFragment()
    , defaultOption = document.createElement('option');

  defaultOption.setAttribute('value', '');

  optionsFragment.appendChild(defaultOption);

  $.each(licenseOptions, function (_, license) {
    var option = document.createElement('option');
    option.setAttribute('value', license.id);
    option.innerText = license.id;
    optionsFragment.appendChild(option);
  });

  $licenseSelect.append(optionsFragment);
};
