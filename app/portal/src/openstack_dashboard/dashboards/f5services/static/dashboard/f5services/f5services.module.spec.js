/*
 *    (c) Copyright 2015 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  describe('horizon.dashboard.f5services', function () {
    it('should be defined', function () {
      expect(angular.module('horizon.dashboard.f5services')).toBeDefined();
    });
  });

  describe('horizon.dashboard.f5services.basePath constant', function () {
    var projectBasePath, staticUrl;

    beforeEach(module('horizon.dashboard.f5services'));
    beforeEach(inject(function ($injector) {
      projectBasePath = $injector.get('horizon.dashboard.f5services.basePath');
      staticUrl = $injector.get('$window').STATIC_URL;
    }));

    it('should be defined', function () {
      expect(projectBasePath).toBeDefined();
    });

    it('should equal to "/static/dashboard/f5services/"', function () {
      expect(projectBasePath).toEqual(staticUrl + 'dashboard/f5services/');
    });
  });

})();
