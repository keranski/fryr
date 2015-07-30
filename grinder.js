'use strict';

function Grinder(callback) {
  return this.init(callback);
}

(function () {

  Grinder.prototype = {

    // Very important object holder
    params: {},

    /**
    * @function init - call once to initialize filtering
    * @param {func} hashChangeCallback - called on every hashchange (first argument is the updated params)
    */
    init: function(hashChangeCallback) {
      var _this = this;

      window.onhashchange = function() {
        var params = _this.parse();
        hashChangeCallback.call(this, params);
      };

      return this;

    },

    /**
    * @function update - remove key/value if present in hash; add key/value if not present in hash
    * @param {string} key - param key to query against
    * @param {mixed} value - value for param key
    * @param {optional boolean} key_is_required {false} - if the key is not required, it will be removed from the hash
    * @param {optional boolean} should_replace_value {false} - if false, value will be appended to the key
    */
    update: function(key, value, key_is_required, should_replace_value) {
      var hash = window.location.hash;
      key_is_required = this.setDefault(key_is_required, false);

      // Ensure key exists in the hash
      if(hash.indexOf(key) !== -1) {
        var key_value = this.param(key);

        var regex_for_value = new RegExp(value, 'g');

        // If key_value contains the new value
        if(regex_for_value.test(key_value)) {

          // If key is required, just swap it out
          if(key_is_required) {
            this.__addValue(key, value, true);
          } else {
            this.__removeValue(key, value);
          }

        // key_value does not contain the new value
        } else {
          this.__addValue(key, value, should_replace_value);

        }

      // Add key if it doesn't exist
      } else {

        if(window.location.hash) {
          window.location.hash += '&' + key + '=' + value;
        } else {
          // Use a question mark if first key
          window.location.hash = '?' + key + '=' + value;
        }

      }

      // Log it to the history
      if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.hash);
      }

    },

    /**
    * @function parse - evaluate the hash
    * @return key/value hash of the hash broken down by params
    */
    parse: function() {
      var hash = window.location.hash;
      var params;

      if(window.location.hash && /\?/g.test(hash)) {
        params = hash.split('?')[1];
        params = params.split('&');

        // Separate params into key values
        for(var i = 0; i < params.length; i++) {
          var key_value = params[i].split('=');
          var key = key_value[0];
          var value = key_value[1];

          this.params[key] = value;
        }
      }

      return this.params;
    },


    /**
    * @function param - retrieve a key's value
    * @param {string} key - param to target
    * @example
    *   window.location.hash = ?color=blue
    *   Grinder.param('color') // => 'blue'
    * @return the value of the key
    */
    param: function(key) {
      if(!window.location.hash) {
        return '';
      }
      var hash = window.location.hash;
      var search = new RegExp('#.*[?&]' + key + '=([^&]+)(&|$)');
      var key_value = hash.match(search);

      return (key_value ? key_value[1] : '');
    },

    // Super private hash location functions
    // DO NOT USE publicly

    /**
    * @private
    * @function removeValue - delete value based on key
    * @param {string} key - param to target
    * @param {mixed} value - value to delete from param
    */
    __removeValue: function(key, value) {
      var hash = window.location.hash;
      var regex_for_value = new RegExp(value, 'g');
      hash = hash.replace(regex_for_value, '');

      // Remove trailing commas
      hash = hash.replace(/\,\&/g, '');
      hash = hash.replace(/\,$/, '');
      hash = hash.replace(/\=\,/g, '=');

      window.location.hash = hash;
    },

    /**
    * @private
    * @function addValue - add value based on key
    * @param {string} key - param to target
    * @param {mixed} value - value to add to param
    * @param {optional boolean} should_replace_value {false} - if false, value will be appended to the param
    */
    __addValue: function(key, value, should_replace_value) {
      var hash = window.location.hash;
      should_replace_value = this.setDefault(should_replace_value, false);

      var old_value = this.param(key);
      var new_value;

      // If it's blank or is the value of the next param
      if(old_value.charAt(0) === '&' || old_value === '') {
        old_value = key + '=';
        new_value = old_value + value;

      } else {
        old_value = key + '=' + old_value;

        // If the value of the param should be replaced, don't append it to the existing value
        new_value = should_replace_value ? (key + '=' + value) : (old_value + ',' + value);
      }

      hash = hash.replace(old_value, new_value);

      window.location.hash = hash;
    },


    /**
    * @function setDefault - Apply value to variable if it has none
    * @param {var} variable - variable to set default to
    * @param {anything} value - default value to attribute to variable
    */
    __setDefault: function(variable, value){
      return (typeof variable === 'undefined') ? value : variable;
    },

  };

})();
