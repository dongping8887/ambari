/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole', [
  'ngRoute',
  'ngAnimate',
  'ui.bootstrap',
  'restangular',
  'toggle-switch',
  'pascalprecht.translate'
])
.constant('Settings', {
  siteRoot: '{proxy_root}/'.replace(/\{.+\}/g, ''),
	baseUrl: '{proxy_root}/api/v1'.replace(/\{.+\}/g, ''),
  testMode: (window.location.port == 8000),
  mockDataPrefix: 'assets/data/',
  isLDAPConfigurationSupported: false,
  isLoginActivitiesSupported: false
})
.config(['RestangularProvider', '$httpProvider', '$provide', 'Settings', function(RestangularProvider, $httpProvider, $provide, Settings) {
  // Config Ajax-module
  RestangularProvider.setBaseUrl(Settings.baseUrl);
  RestangularProvider.setDefaultHeaders({'X-Requested-By':'ambari'});

  $httpProvider.defaults.headers.post['Content-Type'] = 'plain/text';
  $httpProvider.defaults.headers.put['Content-Type'] = 'plain/text';

  $httpProvider.defaults.headers.post['X-Requested-By'] = 'ambari';
  $httpProvider.defaults.headers.put['X-Requested-By'] = 'ambari';
  $httpProvider.defaults.headers.common['X-Requested-By'] = 'ambari';

  $httpProvider.interceptors.push(['Settings', '$q', function(Settings, $q) {
    return {
      'request': function(config) {
        if (Settings.testMode) {
          if (config.method === 'GET') {
            config.url = (config.mock) ? Settings.mockDataPrefix + config.mock : config.url;
          } else {
            config.method = "GET";
          }
        }
        return config;
      }
    };
  }]);

  $httpProvider.responseInterceptors.push(['$rootScope', '$q', function (scope, $q) {
    function success(response) {
      return response;
    }

    function error(response) {
      if (response.status == 403) {
        window.location = Settings.siteRoot;
        return;
      }
      return $q.reject(response);
    }

    return function (promise) {
      return promise.then(success, error);
    }
  }]);

  $provide.factory('TimestampHttpInterceptor', [function($q) {
    return {
      request: function(config) {
        if (config && config.method === 'GET' && config.url.indexOf('html') === -1) {
          config.url += config.url.indexOf('?') < 0 ? '?' : '&';
          config.url += '_=' + new Date().getTime();
         }
         return config || $q.when(config);
      }
   };
  }]);
  $httpProvider.interceptors.push('TimestampHttpInterceptor');

  $provide.decorator('ngFormDirective', ['$delegate', function($delegate) {
    var ngForm = $delegate[0], controller = ngForm.controller;
    ngForm.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
    var $interpolate = $injector.get('$interpolate');
      attrs.$set('name', $interpolate(attrs.name || '')(scope));
      $injector.invoke(controller, this, {
        '$scope': scope,
        '$element': element,
        '$attrs': attrs
      });
    }];
    return $delegate;
  }]);

  $provide.decorator('ngModelDirective', ['$delegate', function($delegate) {
    var ngModel = $delegate[0], controller = ngModel.controller;
    ngModel.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
      var $interpolate = $injector.get('$interpolate');
      attrs.$set('name', $interpolate(attrs.name || '')(scope));
      $injector.invoke(controller, this, {
        '$scope': scope,
        '$element': element,
        '$attrs': attrs
      });
    }];
    return $delegate;
  }]);

  $provide.decorator('formDirective', ['$delegate', function($delegate) {
    var form = $delegate[0], controller = form.controller;
    form.controller = ['$scope', '$element', '$attrs', '$injector', function(scope, element, attrs, $injector) {
      var $interpolate = $injector.get('$interpolate');
      attrs.$set('name', $interpolate(attrs.name || attrs.ngForm || '')(scope));
        $injector.invoke(controller, this, {
        '$scope': scope,
        '$element': element,
        '$attrs': attrs
      });
    }];
    return $delegate;
  }]);

  if (!Array.prototype.find) {
    Array.prototype.find = function (callback, context) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      var list = Object(this),
        length = list.length >>> 0,
        value;
      for (var i = 0; i < length; i++) {
        value = list[i];
        if (callback.call(context, value, i, list)) {
          return value;
        }
      }
      return undefined;
    };
  }
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.constant('ROUTES', {
  root: {
    url: '/',
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  },
  authentication: {
    main: {
      url: '/authentication',
      templateUrl: 'views/authentication/main.html',
      controller: 'AuthenticationMainCtrl'
    }
  },
  loginActivities: {
    loginMessage:{
      url: '/loginMessage',
      templateUrl: 'views/loginActivities/main.html',
      controller: 'LoginActivitiesMainCtrl'
    },
    homeDirectory: {
      url: '/homeDirectory',
      templateUrl: 'views/loginActivities/main.html',
      controller: 'LoginActivitiesMainCtrl'
    }
  },
  users: {
    list: {
      url: '/users',
      templateUrl: 'views/users/list.html',
      controller: 'UsersListCtrl'
    },
    edit: {
      url: '/users/:id/edit',
      templateUrl: 'views/users/create.html',
      controller: 'UsersCreateCtrl'
    },
    create: {
      url: '/users/new',
      templateUrl: 'views/users/create.html',
      controller: 'UsersCreateCtrl'
    },
    show: {
      url: '/users/:id*',
      templateUrl: 'views/users/show.html',
      controller: 'UsersShowCtrl'
    }
  },
  groups: {
    list: {
      url: '/groups',
      templateUrl: 'views/groups/list.html',
      controller: 'GroupsListCtrl'
    },
    edit: {
      url: '/groups/:id/edit',
      templateUrl: 'views/groups/edit.html',
      controller: 'GroupsEditCtrl'
    },
    create: {
      url: '/groups/new',
      templateUrl: 'views/groups/create.html',
      controller: 'GroupsCreateCtrl'
    }
  },
  views: {
    list: {
      url: '/views',
      templateUrl: 'views/ambariViews/listTable.html',
      controller: 'ViewsListCtrl'
    },
    listViewUrls: {
      url: '/viewUrls',
      templateUrl: 'views/ambariViews/listUrls.html',
      controller: 'ViewsListCtrl'
    },
    createViewUrl:{
      url: '/urls/new',
      templateUrl: 'views/urls/create.html',
      controller: 'ViewUrlCtrl'
    },
    linkViewUrl:{
      url: '/urls/link/:viewName/:viewVersion/:viewInstanceName',
      templateUrl: 'views/urls/create.html',
      controller: 'ViewUrlCtrl'
    },
    editViewUrl:{
      url: '/urls/edit/:urlName',
      templateUrl: 'views/urls/edit.html',
      controller: 'ViewUrlEditCtrl'
    },
    edit: {
      url: '/views/:viewId/versions/:version/instances/:instanceId/edit',
      templateUrl: 'views/ambariViews/edit.html',
      controller: 'ViewsEditCtrl'
    },
    create: {
      url: '/views/:viewId/new',
      templateUrl: 'views/ambariViews/create.html',
      controller: 'CreateViewInstanceCtrl'
    }
  },
  stackVersions: {
    list: {
      url: '/stackVersions',
      templateUrl: 'views/stackVersions/list.html',
      controller: 'StackVersionsListCtrl'
    },
    create: {
      url: '/stackVersions/create',
      templateUrl: 'views/stackVersions/stackVersionPage.html',
      controller: 'StackVersionsCreateCtrl'
    },
    edit: {
      url: '/stackVersions/:stackName/:versionId/edit',
      templateUrl: 'views/stackVersions/stackVersionPage.html',
      controller: 'StackVersionsEditCtrl'
    }
  },
  remoteClusters: {
    list: {
      url: '/remoteClusters',
      templateUrl: 'views/remoteClusters/list.html',
      controller: 'RemoteClustersListCtrl'
    },
    create: {
      url: '/remoteClusters/create',
      templateUrl: 'views/remoteClusters/remoteClusterPage.html',
      controller: 'RemoteClustersCreateCtrl'
    },
     edit: {
     url: '/remoteClusters/:clusterName/edit',
     templateUrl: 'views/remoteClusters/editRemoteClusterPage.html',
     controller: 'RemoteClustersEditCtrl'
     }
  },
  clusters: {
    manageAccess: {
      url: '/clusters/:id/manageAccess',
      templateUrl: 'views/clusters/manageAccess.html',
      controller: 'ClustersManageAccessCtrl'
    },
    userAccessList: {
      url: '/clusters/:id/userAccessList',
      templateUrl: 'views/clusters/userAccessList.html',
      controller: 'UserAccessListCtrl'
    }
  },
  dashboard:{
    url: '/dashboard',
    controller: ['$window', function($window) {
      $window.location.replace('/#/main/dashboard');
    }],
    template: ''
  }
})
.config(['$routeProvider', '$locationProvider', 'ROUTES', function($routeProvider, $locationProvider, ROUTES) {
  var createRoute = function(routeObj) {
    if(routeObj.url){
      $routeProvider.when(routeObj.url, routeObj);
    } else {
      angular.forEach(routeObj, createRoute);
    }
  };
  angular.forEach(ROUTES, createRoute);
}])
.run(['$rootScope', 'ROUTES', 'Settings', function($rootScope, ROUTES, Settings) {
  // Make routes available in every template and controller
  $rootScope.ROUTES = ROUTES;
  $rootScope.$on('$locationChangeStart', function (e, nextUrl) {
    if (/\/authentication$/.test(nextUrl) && !Settings.isLDAPConfigurationSupported) {
      e.preventDefault();
    }
  });
  $rootScope.$on('$locationChangeStart', function (e, nextUrl) {
    if ((/\/loginMessage$/.test(nextUrl) || /\/homeDirectory$/.test(nextUrl)) && !Settings.isLoginActivitiesSupported) {
      e.preventDefault();
    }
  });

  /**
   * Method using to generate full URI from site root, this method should be used
   * along with all 'href' attribute or methods which invoke redirect to Ambari Web.
   * This method is useful to determine actual site root when ambari run under proxy server.
   *
   * @param {string} url
   * @returns {string}
   */
  $rootScope.fromSiteRoot = function(url) {
    var path = url[0] === '/' ? url.substring(1) : url;
    return Settings.siteRoot + path;
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.config(['$translateProvider', function($translateProvider) {
  $translateProvider.translations('en',{
    'CLUSTER.ADMINISTRATOR': 'Operator',
    'CLUSTER.USER': 'Read-Only',
    'VIEW.USER': 'Use',

    'common': {
      'ambari': 'Ambari',
      'apacheAmbari': 'Apache Ambari',
      'about': 'About',
      'version': 'Version',
      'signOut': 'Sign out',
      'register':'Register',
      'clusters': 'Clusters',
      'views': 'Views',
      'viewUrls': 'View URLs',
      'roles': 'Roles',
      'users': 'Users',
      'groups': 'Groups',
      'versions': 'Versions',
      'stack': 'Stack',
      'details': 'Details',
      'goToDashboard': 'Go to Dashboard',
      'noClusters': 'No Clusters',
      'noViews': 'No Views',
      'view': 'View',
      'displayLabel': 'Display label',
      'search': 'Search',
      'name': 'Name',
      'any': 'Any',
      'none': 'None',
      'type': 'Type',
      'add': 'Add {{term}}',
      'delete': 'Delete {{term}}',
      'deregisterCluster': 'Deregister Cluster',
      'cannotDelete': 'Cannot Delete {{term}}',
      'privileges': 'Privileges',
      'cluster': 'Cluster',
      'remoteClusters': 'Remote Clusters',
      'services':'Services',
      'clusterRole': 'Cluster Role',
      'viewPermissions': 'View Permissions',
      'getInvolved': 'Get involved!',
      'license': 'Licensed under the Apache License, Version 2.0',
      'tableFilterMessage': '{{showed}} of {{total}} {{term}} showing',
      'yes': 'Yes',
      'no': 'No',
      'renameCluster': 'Rename Cluster',
      'renameClusterTip': 'Only alpha-numeric characters, up to 80 characters',
      'clusterCreationInProgress': 'Cluster creation in progress...',
      'userGroupManagement': 'User + Group Management',
      'all': 'All',
      'group': 'Group',
      'user': 'User',
      'settings': 'Settings',
      'authentication': 'Authentication',
      'deleteConfirmation': 'Are you sure you want to delete {{instanceType}} {{instanceName}}?',
      'remoteClusterDelConfirmation':'Are you sure you want to delete {{instanceType}} {{instanceName}}? This operation cannot be undone.',
      'messageInstanceAffected':'The following View Instances are using this Remote Cluster for configuration, and will need to be reconfigured: {{viewInstance}}',
      'local': 'Local',
      'pam': 'PAM',
      'ldap': 'LDAP',
      'jwt': 'JWT',
      'warning': 'Warning',
      'filterInfo': '{{showed}} of {{total}} {{term}} showing',
      'usersGroups': 'Users/Groups',
      'enabled': 'Enabled',
      'disabled': 'Disabled',
      'NA': 'n/a',
      'blockViewLabel': 'BLOCK',
      'listViewLabel': 'LIST',
      'rbac': 'Role Based Access Control',
      'important': 'Important',
      'undo': 'Undo',
      'fromGroupMark': '(from group)',
      'hidden' : 'Hidden',

      'clusterNameChangeConfirmation': {
        'title': 'Confirm Cluster Name Change',
        'message': 'Are you sure you want to change the cluster name to {{clusterName}}?'
      },

      'loginActivities': {
        'loginActivities':'Login Activities',
        'loginMessage': 'Login Message',
        'loginMessage.placeholder': 'Please enter login message',
        'buttonText.placeholder': 'Please enter button text',
        'homeDirectory': 'Home Directory',
        'notEmpty': 'These field cannot be empty',
        'saveError': 'Save error',
        'message': 'Message',
        'buttonText': 'Button',
        'status': 'Status',
        'status.disabled': 'Disabled',
        'homeDirectory.alert': 'Many Ambari Views store user preferences in the logged in user\'s / user directory in HDFS. Optionally, Ambari can auto-create these directories for users on login.',
        'homeDirectory.autoCreate': 'Auto-Create HDFS user directories',
        'homeDirectory.header': 'User Directory Creation Options',
        'homeDirectory.template': 'User Directory creation template',
        'homeDirectory.group': 'Default Group',
        'homeDirectory.permissions': 'Permissions'
      },

      'controls': {
        'cancel': 'Cancel',
        'close': 'Close',
        'ok': 'OK',
        'save': 'Save',
        'clearFilters': 'clear filters',
        'confirmChange': 'Confirm Change',
        'discard': 'Discard',
        'remove': 'Remove',
        'update':'Update',
        'checkAll': 'Check All',
        'clearAll': 'Clear All'
      },

      'alerts': {
        'fieldRequired': 'Field required!',
        'fieldIsRequired': 'This field is required.',
        'noSpecialChars': 'Must not contain special characters!',
        'nothingToDisplay': 'No {{term}} to display.',
        'noRemoteClusterDisplay':'No Remote Clusters to display.',
        'noPrivileges': 'No {{term}} privileges',
        'noPrivilegesDescription': 'This {{term}} does not have any privileges.',
        'timeOut': 'You will be automatically logged out in <b>{{time}}</b> seconds due to inactivity.',
        'isInvalid': '{{term}} Invalid.',
        'cannotSavePermissions': 'Cannot save permissions',
        'cannotLoadPrivileges': 'Cannot load privileges',
        'cannotLoadClusterStatus': 'Cannot load cluster status',
        'clusterRenamed': 'The cluster has been renamed to {{clusterName}}.',
        'remoteClusterRegistered': 'The cluster has been registered as {{clusterName}}.',
        'cannotRenameCluster': 'Cannot rename cluster to {{clusterName}}',
        'minimumTwoChars': 'Minimum length is 2 characters.',
        'maxTwentyFiveChars': 'Maximum length is 25 characters.',
        'onlyText': 'Only lowercase alphanumeric characters are allowed.',
        'onlyAnScore': 'Invalid input, only alphanumerics allowed eg: My_default_view',
        'passwordRequired':'Password Required',
        'unsavedChanges': 'You have unsaved changes. Save changes or discard?'
      }
    },

    'main': {
      'title': 'Welcome to Apache Ambari',
      'noClusterDescription': 'Provision a cluster, manage who can access the cluster, and customize views for Ambari users.',
      'hasClusterDescription': 'Monitor your cluster resources, manage who can access the cluster, and customize views for Ambari users.',
      'autoLogOut': 'Automatic Logout',

      'operateCluster': {
        'title': 'Operate Your Cluster',
        'description': 'Manage the configuration of your cluster and monitor the health of your services',
        'manageRoles': 'Manage Roles'
      },

      'createCluster': {
        'title': 'Create a Cluster',
        'description': 'Use the Install Wizard to select services and configure your cluster',
        'launchInstallWizard': 'Launch Install Wizard'
      },

      'manageUsersAndGroups': {
        'title': 'Manage Users + Groups',
        'description': 'Manage the users and groups that can access Ambari'
      },

      'deployViews': {
        'title': 'Deploy Views',
        'description': 'Create view instances and grant permissions'
      },

      'controls': {
        'remainLoggedIn': 'Remain Logged In',
        'logOut': 'Log Out Now'
      }
    },

    'views': {
      'instance': 'Instance',
      'viewInstance': 'View Instance',
      'create': 'Create Instance',
      'createViewInstance': 'Create View Instance',
      'edit': 'Edit',
      'viewName': 'View Name',
      'instances': 'Instances',
      'instanceName': 'Instance Name',
      'instanceId': 'Instance ID',
      'displayName': 'Display Name',
      'settings': 'Settings',
      'advanced': 'Advanced',
      'visible': 'Visible',
      'description': 'Description',
      'shortUrl':'Short URL',
      'instanceDescription': 'Instance Description',
      'clusterConfiguration': 'Cluster Configuration',
      'localCluster': 'Local Cluster',
      'remoteCluster': 'Remote Cluster',
      'registerRemoteCluster' : 'Register Remote Cluster',
      'clusterName': 'Cluster Name',
      'custom': 'Custom',
      'icon': 'Icon',
      'icon64': 'Icon64',
      'permissions': 'Permissions',
      'permission': 'Permission',
      'grantUsers': 'Grant permission to these users',
      'grantGroups': 'Grant permission to these groups',
      'configuration': 'Configuration',
      'goToInstance': 'Go to instance',
      'pending': 'Pending...',
      'deploying': 'Deploying...',
      'properties': 'properties',
      'urlDelete':'Delete URL',

      'clusterPermissions': {
        'label': 'Local Cluster Permissions',
        'clusteradministrator': 'Cluster Administrator',
        'clusteroperator': 'Cluster Operator',
        'clusteruser': 'Cluster User',
        'serviceadministrator': 'Service Administrator',
        'serviceoperator': 'Service Operator',
        'infoMessage': 'Grant <strong>Use</strong> permission for the following <strong>{{cluster}}</strong> Roles:',
        'nonLocalClusterMessage': 'The ability to inherit view <strong>Use</strong> permission based on Cluster Roles is only available when using a Local Cluster configuration.'
      },

      'alerts': {
        'noSpecialChars': 'Must not contain any special characters.',
        'noSpecialCharsOrSpaces': 'Must not contain any special characters or spaces.',
        'instanceExists': 'Instance with this name already exists.',
        'notDefined': 'There are no {{term}} defined for this view.',
        'cannotEditInstance': 'Cannot Edit Static Instances',
        'cannotDeleteStaticInstance': 'Cannot Delete Static Instances',
        'deployError': 'Error deploying. Check Ambari Server log.',
        'unableToCreate': 'Unable to create view instances',
        'cannotUseOption': 'This view cannot use this option',
        'unableToResetErrorMessage': 'Unable to reset error message for prop: {{key}}',
        'instanceCreated': 'Created View Instance {{instanceName}}',
        'unableToParseError': 'Unable to parse error message: {{message}}',
        'cannotCreateInstance': 'Cannot create instance',
        'cannotLoadInstanceInfo': 'Cannot load instance info',
        'cannotLoadPermissions': 'Cannot load permissions',
        'cannotSaveSettings': 'Cannot save settings',
        'cannotSaveProperties': 'Cannot save properties',
        'cannotDeleteInstance': 'Cannot delete instance',
        'cannotLoadViews': 'Cannot load views',
        'cannotLoadViewUrls': 'Cannot load view URLs',
        'cannotLoadViewUrl': 'Cannot load view URL',
        'savedRemoteClusterInformation':'Remote cluster information is saved.',
        'credentialsUpdated':'Credentials Updated.'
      }
    },

    'urls':{
      'name':'Name',
      'url':'URL',
      'viewUrls':'View URLs',
      'createNewUrl':'Create New URL',
      'create':'Create',
      'edit':'Edit',
      'view':'View',
      'viewInstance':'Instance',
      'step1':'Create URL',
      'step2':'Select instance',
      'step3':'Assign URL',
      'noUrlsToDisplay':'No URLs to display.',
      'noViewInstances':'No view instances',
      'none':'None',
      'change':'Change',
      'urlCreated':'Created short URL <a href="{{siteRoot}}#/main/view/{{viewName}}/{{shortUrl}}">{{urlName}}</a>',
      'urlUpdated':'Updated short URL <a href="{{siteRoot}}#/main/view/{{viewName}}/{{shortUrl}}">{{urlName}}</a>'
    },

    'clusters': {
      'switchToList': 'Switch&nbsp;to&nbsp;list&nbsp;view',
      'switchToBlock': 'Switch&nbsp;to&nbsp;block&nbsp;view',
      'role': 'Role',
      'assignRoles': 'Assign roles to these {{term}}',

      'alerts': {
        'cannotLoadClusterData': 'Cannot load cluster data'
      }
    },

    'groups': {
      'createLocal': 'Create Local Group',
      'name': 'Group name',
      'members': 'Members',
      'membersPlural': '{{n}} member{{n == 1 ? "" : "s"}}',

      'alerts': {
        'onlySimpleChars': 'Must contain only simple characters.',
        'groupCreated': 'Created group <a href="#/groups/{{groupName}}/edit">{{groupName}}</a>',
        'groupCreationError': 'Group creation error',
        'cannotUpdateGroupMembers': 'Cannot update group members',
        'getGroupsListError': 'Get groups list error'
      }
    },

    'users': {
      'username': 'Username',
      'userName': 'User name',
      'admin': 'Admin',
      'ambariAdmin': 'Ambari Admin',
      'ambariClusterURL':'Ambari Cluster URL',
      'changePassword': 'Change Password',
      'updateCredentials':'Update Credentials',
      'changePasswordFor': 'Change Password for {{userName}}',
      'yourPassword': 'Your Password',
      'newPassword': 'New User Password',
      'newPasswordConfirmation': 'New User Password Confirmation',
      'create': 'Create Local User',
      'active': 'Active',
      'inactive': 'Inactive',
      'status': 'Status',
      'password': 'Password',
      'passwordConfirmation': 'Password сonfirmation',
      'userIsAdmin': 'This user is an Ambari Admin and has all privileges.',
      'showAll': 'Show all users',
      'showAdmin': 'Show only admin users',
      'groupMembership': 'Group Membership',
      'userNameTip': 'Maximum length is 80 characters. \\, &, |, <, >, ` are not allowed.',

      'changeStatusConfirmation': {
        'title': 'Change Status',
        'message': 'Are you sure you want to change status for user "{{userName}}" to {{status}}?'
      },

      'changePrivilegeConfirmation': {
        'title': 'Change Admin Privilege',
        'message': 'Are you sure you want to {{action}} Admin privilege to user "{{userName}}"?'
      },

      'roles': {
        'clusterUser': 'Cluster User',
        'clusterAdministrator': 'Cluster Administrator',
        'clusterOperator': 'Cluster Operator',
        'serviceAdministrator': 'Service Administrator',
        'serviceOperator': 'Service Operator',
        'ambariAdmin': 'Ambari Administrator',
        'viewUser': 'View User',
        'none': 'None',
        'oneRolePerUserOrGroup': 'Only 1 role allowed per user or group',
        'permissionLevel': '{{level}}-level Permissions'
      },

      'alerts': {
        'passwordRequired': 'Password required',
        'wrongPassword': 'Password must match!',
        'usernameRequired':'Username Required',
        'cannotChange': 'Cannot Change {{term}}',
        'userCreated': 'Created user <a href="#/users/{{encUserName}}">{{userName}}</a>',
        'userCreationError': 'User creation error',
        'removeUserError': 'Removing from group error',
        'cannotAddUser': 'Cannot add user to group',
        'passwordChanged': 'Password changed.',
        'cannotChangePassword': 'Cannot change password',
        'roleChanged': '{{name}} changed to {{role}}',
        'roleChangedToNone': '{{user_name}}\'s explicit privilege has been changed to \'NONE\'. Any privilege now seen for this user comes through its Group(s).',
        'usersEffectivePrivilege': '{{user_name}}\'s effective privilege through its Group(s) is higher than your selected privilege.'
      }
    },

    'versions': {
      'current': 'Current',
      'addVersion': 'Add Version',
      'defaultVersion': '(Default Version Definition)',
      'inUse': 'In Use',
      'installed': 'Installed',
      'usePublic': "Use Public Repository",
      'networkIssues': {
        'networkLost': "Why is this disabled?",
        'publicDisabledHeader': "Public Repository Option Disabled",
        'publicRepoDisabledMsg': 'Ambari does not have access to the Internet and cannot use the Public Repository for installing the software. Your Options:',
        'publicRepoDisabledMsg1': 'Configure your hosts for access to the Internet.',
        'publicRepoDisabledMsg2': 'If you are using an Internet Proxy, refer to the Ambari Documentation on how to configure Ambari to use the Internet Proxy.',
        'publicRepoDisabledMsg3': 'Use the Local Repositoy option.'
      },
      'selectVersion': "Select Version",
      'selectVersionEmpty': "No other repositories",
      'useLocal': "Use Local Repository",
      'uploadFile': 'Upload Version Definition File',
      'enterURL': 'Version Definition File URL',
      'defaultURL': 'https://',
      'readInfo': 'Read Version Info',
      'browse': 'Browse',
      'installOn': 'Install on...',
      'register': {
        'title': 'Register Version',
        'error': {
          'header': 'Unable to Register',
          'body': 'You are attempting to register a version with a Base URL that is already in use with an existing registered version. You *must* review your Base URLs and confirm they are unique for the version you are trying to register.'
        }
      },
      'deregister': 'Deregister Version',
      'deregisterConfirmation': 'Are you sure you want to deregister version <strong>{{versionName}}</strong> ?',
      'placeholder': 'Version Number (0.0)',
      'repos': 'Repositories',
      'os': 'OS',
      'baseURL': 'Base URL',
      'skipValidation': 'Skip Repository Base URL validation (Advanced)',
      'noVersions': 'Select version to display details.',
      'patch': 'Patch',
      'maint': 'Maint',
      'introduction': 'To register a new version in Ambari, provide a Version Definition File, confirm the software repository information and save the version.',
      'contents': {
        'title': 'Contents',
        'empty': 'No contents to display'
      },
      'details': {
        'stackName': 'Stack Name',
        'displayName': 'Display Name',
        'version': 'Version',
        'actualVersion': 'Actual Version',
        'releaseNotes': 'Release Notes'
      },
      'repository': {
        'placeholder': 'Enter Base URL or remove this OS'
      },
      'useRedhatSatellite': {
        'title': 'Use RedHat Satellite/Spacewalk',
        'warning': 'By selecting to <b>"Use RedHat Satellite/Spacewalk"</b> for the software repositories, ' +
        'you are responsible for configuring the repository channel in Satellite/Spacewalk and confirming the repositories for the selected <b>stack version</b> are available on the hosts in the cluster. ' +
        'Refer to the Ambari documentation for more information.',
        'disabledMsg': 'Use of RedHat Satellite/Spacewalk is not available when using Public Repositories'
      },
      'changeBaseURLConfirmation': {
        'title': 'Confirm Base URL Change',
        'message': 'You are about to change repository Base URLs that are already in use. Please confirm that you intend to make this change and that the new Base URLs point to the same exact Stack version and build'
      },

      'alerts': {
        'baseURLs': 'Provide Base URLs for the Operating Systems you are configuring.',
        'validationFailed': 'Some of the repositories failed validation. Make changes to the base url or skip validation if you are sure that urls are correct',
        'skipValidationWarning': '<b>Warning:</b> This is for advanced users only. Use this option if you want to skip validation for Repository Base URLs.',
        'useRedhatSatelliteWarning': 'Disable distributed repositories and use RedHat Satellite/Spacewalk channels instead',
        'filterListError': 'Fetch stack version filter list error',
        'versionCreated': 'Created version <a href="#/stackVersions/{{stackName}}/{{versionName}}/edit">{{stackName}}-{{versionName}}</a>',
        'versionCreationError': 'Version creation error',
        'allOsAdded': 'All Operating Systems have been added',
        'osListError': 'getSupportedOSList error',
        'readVersionInfoError': 'Version Definition read error',
        'versionEdited': 'Edited version <a href="#/stackVersions/{{stackName}}/{{versionName}}/edit">{{displayName}}</a>',
        'versionUpdateError': 'Version update error',
        'versionDeleteError': 'Version delete error'
      }
    },

    'authentication': {
      'description': 'Ambari supports authenticating against local Ambari users created and stored in the Ambari Database, or authenticating against a LDAP server:',
      'ldap': 'LDAP Authentication',
      'on': 'On',
      'off': 'Off',

      'connectivity': {
        'title': 'LDAP Connectivity Configuration',
        'host': 'LDAP Server Host',
        'port': 'LDAP Server Port',
        'ssl': 'Use SSL?',
        'trustStore': {
          'label': 'Trust Store',
          'options': {
            'default': 'JDK Default',
            'custom': 'Custom'
          }
        },
        'trustStorePath': 'Trust Store Path',
        'trustStoreType': {
          'label': 'Trust Store Type',
          'options': {
            'jks': 'JKS',
            'jceks': 'JCEKS',
            'pkcs12': 'PKCS12'
          }
        },
        'trustStorePassword': 'Trust Store Password',
        'dn': 'Bind DN',
        'bindPassword': 'Bind Password',

        'controls': {
          'testConnection': 'Test Connection'
        }
      },

      'attributes': {
        'title': 'LDAP Attribute Configuration',
        'detection': {
          'label': 'Identifying the proper attributes to be used when authenticating and looking up users and groups can be specified manually, or automatically detected. Please choose:',
          'options': {
            'manual': 'Define Attributes Manually',
            'auto': 'Auto-Detect Attributes'
          }
        },
        'userSearch': 'User Search Base',
        'groupSearch': 'Group Search Base',
        'detected': 'The following attributes were detected, please review and Test Attributes to ensure their accuracy.',
        'userObjClass': 'User Object Class',
        'userNameAttr': 'User Name Attribute',
        'groupObjClass': 'Group Object Class',
        'groupNameAttr': 'Group Name Attribute',
        'groupMemberAttr': 'Group Member Attribute',
        'distinguishedNameAttr': 'Distinguished Name Attribute',
        'test': {
          'description': 'To quickly test the chosen attributes click the button below. During this process you can specify a test user name and password and Ambari will attempt to authenticate and retrieve group membership information',
          'username': 'Test Username',
          'password': 'Test Password'
        },
        'groupsList': 'List of Groups',

        'controls': {
          'autoDetect': 'Perform Auto-Detection',
          'testAttrs': 'Test Attributes'
        },

        'alerts': {
          'successfulAuth': 'Successful Authentication'
        }
      },

      'controls': {
        'test': 'Test'
      }
    }
  });

  $translateProvider.preferredLanguage('en');
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('MainCtrl',['$scope','$rootScope','$window','Auth', 'Alert', '$modal', 'Cluster', 'View', '$translate', '$http', 'Settings', function($scope, $rootScope, $window, Auth, Alert, $modal, Cluster, View, $translate, $http, Settings) {
  var $t = $translate.instant;
  $scope.signOut = function() {
    Auth.signout().finally(function() {
      $window.location.pathname = Settings.siteRoot;
    });
  };

  $scope.ambariVersion = null;
  $rootScope.supports = {};

  $http.get(Settings.baseUrl + "/persist/user-pref-" + Auth.getCurrentUser() + "-supports")
      .then(function(data) {
        $rootScope.supports = data.data ? data.data : {};
      });

  $http.get(Settings.baseUrl + "/users/"  + Auth.getCurrentUser() +  "/authorizations?fields=*")
    .then(function(data) {
      var auth = !!data.data && !!data.data.items ? data.data.items.map(function (a){return a.AuthorizationInfo.authorization_id}) : [];
      if(auth.indexOf('AMBARI.RENAME_CLUSTER') == -1){
        $window.location = $rootScope.fromSiteRoot("/#/main/dashboard");
      }
    });

  $scope.about = function() {
   var ambariVersion = $scope.ambariVersion;
  	var modalInstance = $modal.open({
  		templateUrl:'views/modals/AboutModal.html',
  		controller: ['$scope', function($scope) {
  			$scope.ok = function() {
  				modalInstance.close();
  			};
        $scope.ambariVersion = ambariVersion;
  		}]
  	});
  };

  $scope.currentUser = Auth.getCurrentUser();

  $scope.cluster = null;
  $scope.isLoaded = null;

  function loadAmbariVersion() {
    Cluster.getAmbariVersion().then(function(version){
      $scope.ambariVersion = version;
    });
  }

  function loadClusterData(){
    Cluster.getStatus().then(function(cluster) {
      $scope.cluster = cluster;
      $scope.isLoaded = true;
      if(cluster && cluster.Clusters.provisioning_state === 'INIT'){
        setTimeout(loadClusterData, 1000);
      }
    }).catch(function(data) {
      Alert.error($t('common.alerts.cannotLoadClusterStatus'), data.statusText);
    });
  }
  loadClusterData();
  loadAmbariVersion();

  $scope.viewInstances = [];

  $scope.updateInstances = function () {
    View.getAllVisibleInstance().then(function(instances) {
      $scope.viewInstances = instances.map(function(i) {
        i.viewUrl = i.view_name + '/' + i.version + '/' + i.instance_name;
        return i;
      });
    });
  };

  $scope.gotoViewsDashboard =function() {
    window.location = Settings.siteRoot + '#/main/views';
  };

  $scope.$root.$on('instancesUpdate', function (event, data) {
    $scope.updateInstances();
  });

  $scope.startInactiveTimeoutMonitoring = function(timeout) {
    var TIME_OUT = timeout;
    var active = true;
    var lastActiveTime = Date.now();

    var keepActive = function() {
      if (active) {
        lastActiveTime = Date.now();
      }
    };

    $(window).bind('mousemove', keepActive);
    $(window).bind('keypress', keepActive);
    $(window).bind('click', keepActive);

    var checkActiveness = function() {
      var remainTime = TIME_OUT - (Date.now() - lastActiveTime);
      if (remainTime < 0) {
        active = false;
        $(window).unbind('mousemove', keepActive);
        $(window).unbind('keypress', keepActive);
        $(window).unbind('click', keepActive);
        clearInterval($rootScope.userActivityTimeoutInterval);
        $scope.signOut();
      } else if (remainTime < 60000 && !$rootScope.timeoutModal) {
        $rootScope.timeoutModal = $modal.open({
          templateUrl: 'views/modals/TimeoutWarning.html',
          backdrop: false,
          controller: ['$scope', 'Auth', function($scope, Auth) {
            $scope.remainTime = 60;
            $scope.title = $t('main.autoLogOut');
            $scope.primaryText = $t('main.controls.remainLoggedIn');
            $scope.secondaryText = $t('main.controls.logOut');
            $scope.remain = function() {
              $rootScope.timeoutModal.close();
              delete $rootScope.timeoutModal;
            };
            $scope.logout = function() {
              $rootScope.timeoutModal.close();
              delete $rootScope.timeoutModal;
              Auth.signout().finally(function() {
                $window.location.pathname = Settings.siteRoot;
              });
            };
            $scope.countDown = function() {
              $scope.remainTime--;
              $scope.$apply();
              if ($scope.remainTime == 0) {
                Auth.signout().finally(function() {
                  $window.location.pathname = Settings.siteRoot;
                });
              }
            };
            setInterval($scope.countDown, 1000);
          }]
        });
      }
    };
    $rootScope.userActivityTimeoutInterval = window.setInterval(checkActiveness, 1000);
  };

  // Send noop requests every 10 seconds just to keep backend session alive
  $scope.startNoopPolling = function() {
    $rootScope.noopPollingInterval = setInterval(Cluster.getAmbariTimeout, 10000);
  };

  if (!$rootScope.userActivityTimeoutInterval) {
    Cluster.getAmbariTimeout().then(function(timeout) {
      $rootScope.userTimeout = Number(timeout) * 1000;
      if ($rootScope.userTimeout > 0)
        $scope.startInactiveTimeoutMonitoring($rootScope.userTimeout);
    });
  }
  if (!$rootScope.noopPollingInterval) {
    $scope.startNoopPolling();
  }
  $scope.updateInstances();
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('NavbarCtrl',['$scope', 'Cluster', '$location', 'Alert', 'ROUTES', 'ConfirmationModal', '$rootScope', 'Stack', '$translate', 'Settings', function($scope, Cluster, $location, Alert, ROUTES, ConfirmationModal, $rootScope, Stack, $translate, Settings) {
  var $t = $translate.instant;
  $scope.cluster = null;
  $scope.totalRepos = 0;
  $scope.editCluster = {
    name        : '',
    editingName : false
  };
  $scope.settings = Settings;

  function loadClusterData() {
    Cluster.getStatus().then(function (cluster) {
      $scope.cluster = cluster;
      Stack.allRepos({version: '',
        cluster: {
          options: [],
          current: null
        }}, {}).then(function (repos) {
          $scope.totalRepos = repos.itemTotal;
        });
      if (cluster && cluster.Clusters.provisioning_state === 'INIT') {
        setTimeout(loadClusterData, 1000);
      }
    }).catch(function (data) {
      Alert.error($t('common.alerts.cannotLoadClusterStatus'), data.statusText);
    });
  }
  loadClusterData();

  $scope.toggleEditName = function($event) {
    if ($event && $event.keyCode !== 27) {
      // 27 = Escape key
      return false;
    }

    $scope.editCluster.name         = $scope.cluster.Clusters.cluster_name;
    $scope.editCluster.editingName  = !$scope.editCluster.editingName;
  };

  $scope.clusterDisplayName = function () {
    var name="";
    if($scope.cluster && $scope.cluster.Clusters)
    {
       name = $scope.cluster.Clusters.cluster_name;
    }
    return name.length > 13 ? name.substr(0, 13) + "..." : name;
  };

  $scope.confirmClusterNameChange = function() {
    ConfirmationModal.show(
      $t('common.clusterNameChangeConfirmation.title'),
      $t('common.clusterNameChangeConfirmation.message', {
        clusterName: $scope.editCluster.name
      })
    )
      .then(function() {
        $scope.saveClusterName();
      }).catch(function() {
        // user clicked cancel
        $scope.toggleEditName();
      });
  };

  $scope.saveClusterName = function() {
    var oldClusterName = $scope.cluster.Clusters.cluster_name,
        newClusterName = $scope.editCluster.name;

    Cluster.editName(oldClusterName, newClusterName).then(function(data) {
      $scope.cluster.Clusters.cluster_name = newClusterName;
      Alert.success($t('common.alerts.clusterRenamed', {clusterName: newClusterName}));
    }).catch(function(data) {
      Alert.error($t('common.alerts.cannotRenameCluster', {clusterName: newClusterName}), data.data.message);
    });

    $scope.toggleEditName();
  };

  $scope.isActive = function(path) {
  	var route = ROUTES;
  	angular.forEach(path.split('.'), function(routeObj) {
  		route = route[routeObj];
  	});

    // We should compare only root location part
  	var r = new RegExp( route.url.replace(/(:\w+)/, '\\w+')),
      secondSlashUrlIndex = $location.path().indexOf('/', 1),
      locationIsRoot = !~secondSlashUrlIndex,
      location = locationIsRoot ?  $location.path() : $location.path().slice(0, secondSlashUrlIndex);
  	return r.test(location);
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('AuthenticationMainCtrl', ['$scope', '$translate', 'Alert', 'Settings', function ($scope, $translate, $Alert, Settings) {
    $scope.t = $translate.instant;
    $scope.settings = Settings;

    $scope.isLDAPEnabled = false;
    $scope.connectivity = {
      trustStore: 'default',
      trustStoreOptions: ['default', 'custom'],
      trustStoreType: 'jks',
      trustStoreTypeOptions: ['jks', 'jceks', 'pkcs12']
    };
    $scope.attributes = {
      detection: 'auto'
    };

    $scope.isConnectivityFormInvalid = true;
    $scope.isAutoDetectFormInvalid = true;
    $scope.isAttributesFormInvalid = true;
    $scope.isTestAttributesFormInvalid = false;

    $scope.isRequestRunning = false;

    $scope.isConnectionTestRunning = false;
    $scope.isConnectionTestComplete = false;
    $scope.hasConnectionTestPassed = false;

    $scope.isAttributeDetectionRunning = false;
    $scope.isAttributeDetectionComplete = false;
    $scope.isAttributeDetectionSuccessful = false;

    $scope.isTestAttributesRunning = false;
    $scope.isTestAttributesComplete = false;
    $scope.isTestAttributesSuccessful = false;

    $scope.isSaving = false;
    $scope.isSavingComplete = false;
    $scope.isSavingSuccessful = false;

    $scope.isTestAttributesFormShown = false;

    $scope.toggleAuthentication = function () {
      $scope.isConnectionTestRunning = false;
      $scope.isConnectionTestComplete = false;
      $scope.hasConnectionTestPassed = false;
    };

    $scope.testConnection = function () {
      $scope.isConnectionTestRunning = true;
      $scope.isConnectionTestComplete = false;
      $scope.isAttributeDetectionRunning = false;
      $scope.isAttributeDetectionComplete = false;
      $scope.isAttributeDetectionSuccessful = false;

      // TODO replace mock with test connection request when API is available
      setTimeout(function (prevValue) {
        $scope.isConnectionTestRunning = false;
        $scope.isConnectionTestComplete = true;
        $scope.hasConnectionTestPassed = !prevValue;
      }, 1000, $scope.hasConnectionTestPassed);
      $scope.hasConnectionTestPassed = false;
    };

    $scope.detectAttributes = function () {
      $scope.isAttributeDetectionRunning = true;
      $scope.isAttributeDetectionComplete = false;

      // TODO replace mock with attributes detection request when API is available
      setTimeout(function (prevValue) {
        $scope.isAttributeDetectionRunning = false;
        $scope.isAttributeDetectionComplete = true;
        $scope.isAttributeDetectionSuccessful = !prevValue;
        if ($scope.isAttributeDetectionSuccessful) {
          var form = $scope.attributes;
          form.userObjClass = 'person';
          form.userNameAttr = 'sAMAccountName';
          form.groupObjClass = 'group';
          form.groupNameAttr = 'cn';
          form.groupMemberAttr = 'member';
          form.distinguishedNameAttr = 'distinguishedName';
        }
      }, 1000, $scope.isAttributeDetectionSuccessful);

      $scope.isAttributeDetectionSuccessful = false;
    };

    $scope.showTestAttributesForm = function () {
      $scope.isTestAttributesFormShown = true;
    };

    $scope.testAttributes = function () {
      $scope.isTestAttributesRunning = true;
      $scope.isTestAttributesComplete = false;

      // TODO replace mock with test attributes request when API is available
      setTimeout(function (prevValue) {
        $scope.isTestAttributesRunning = false;
        $scope.isTestAttributesComplete = true;
        $scope.isTestAttributesSuccessful = !prevValue;
        if ($scope.isTestAttributesSuccessful) {
          $scope.attributes.availableGroups = ['HadoopOps', 'HadoopOpsDFW', 'AmbariAdmins', 'ExchangeAdmins', 'AmbariUsers', 'ExchangeUsers'];
        }
      }, 1000, $scope.isTestAttributesSuccessful);
      $scope.isTestAttributesSuccessful = false;
    };

    $scope.save = function () {
      $scope.isSaving = true;
      $scope.isSavingComplete = false;
      // TODO replace mock with save request when API is available
      setTimeout(function (prevValue) {
        $scope.isSaving = false;
        $scope.isSavingComplete = true;
        $scope.isSavingSuccessful = !prevValue;
        if ($scope.isSavingSuccessful) {
          $Alert.success('Settings saved');
        } else {
          $Alert.error('Saving failed', '500 Error');
        }
      }, 1000, $scope.isSavingSuccessful);
      $scope.isSavingSuccessful = false;
    };

    $scope.$watch('connectivity', function (form, oldForm, scope) {
      scope.isConnectivityFormInvalid = !(form.host && form.port
        && (form.trustStore === 'default' || form.trustStorePath && form.trustStorePassword)
        && form.dn && form.bindPassword);
    }, true);

    $scope.$watch('attributes', function (form, oldForm, scope) {
      scope.isAutoDetectFormInvalid = !(form.userSearch && form.groupSearch);
      scope.isAttributesFormInvalid = !(form.userObjClass && form.userNameAttr && form.groupObjClass
        && form.groupNameAttr && form.groupMemberAttr && form.distinguishedNameAttr
        && (form.detection === 'auto' || form.userSearchManual && form.groupSearchManual));
      scope.isTestAttributesFormInvalid = !(form.username && form.password);
    }, true);

    $scope.$watch('attributes.detection', function (newValue, oldValue, scope) {
      scope.isTestAttributesFormShown = false;
      scope.isAttributeDetectionComplete = false;
      scope.isAttributeDetectionSuccessful = false;
    });

    $scope.$watch(function (scope) {
      return scope.isConnectionTestRunning || scope.isAttributeDetectionRunning || scope.isTestAttributesRunning || scope.isSaving;
    }, function (newValue, oldValue, scope) {
      scope.isRequestRunning = newValue;
    });
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('LoginActivitiesMainCtrl',['$scope', '$location', function($scope, $location) {
    $scope.tab = $location.path().substr(1) == "loginActivities" ? "loginMessage" : $location.path().substr(1);
  }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('LoginMessageMainCtrl',['$scope', 'Alert', '$timeout', '$location', '$http', '$translate', 'UnsavedDialog', function($scope, Alert, $timeout, $location, $http, $translate, UnsavedDialog) {
    var $t = $translate.instant,
      targetUrl = '/loginActivities';

    $scope.getMOTD = function() {
      $http.get('/api/v1/settings/motd').then(function (res) {
        $scope.motdExists = true;
        var
          response = JSON.parse(res.data.Settings.content.replace(/\n/g, "\\n")),
          lt = /&lt;/g,
          gt = /&gt;/g,
          ap = /&#39;/g,
          ic = /&#34;/g;

        $scope.text = response.text ? response.text.toString().replace(lt, "<").replace(gt, ">").replace(ap, "'").replace(ic, '"') : "";
        $scope.buttonText = response.button ? response.button.toString().replace(lt, "<").replace(gt, ">").replace(ap, "'").replace(ic, '"') : "OK";
        $scope.status = response.status && response.status == "true" ? true : false;
      }, function(response) {
        $scope.status = false;
        $scope.motdExists = false;
        $scope.text = "";
        $scope.buttonText = "OK";
      });
      $scope.submitDisabled = true;
    };

    $scope.inputChangeEvent = function(){
      $scope.submitDisabled = false;
    };
    $scope.changeStatus = function(){
      $scope.submitDisabled = false;
    };

    $scope.cancel = function() {
      $scope.getMOTD();
    };

    $scope.$watch(function(scope) {
      return scope.submitDisabled;
    }, function(submitDisabled) {
      $scope.form.$dirty = !submitDisabled
    });

    $scope.saveLoginMsg = function(targetUrl) {
      var
        method = $scope.motdExists ? 'PUT' : 'POST',
        text = "",
        buttonText = "",
        lt = /</g,
        gt = />/g,
        ap = /'/g,
        ic = /"/g;

      text = $scope.text.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
      buttonText = $scope.buttonText ? $scope.buttonText.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;") : $scope.buttonText;

      var data = {
        'Settings' : {
          'content' : '{"text":"' + text + '", "button":"' + buttonText + '", "status":"' + $scope.status + '"}',
          'name' : 'motd',
          'setting_type' : 'ambari-server'
        }
      };
      $scope.form.submitted = true;
      if ($scope.form.$valid){
        $scope.submitDisabled = true;
        return $http({
          method: method,
          url: '/api/v1/settings/' + ($scope.motdExists ? 'motd' : ''),
          data: data
        }).then(function successCallback() {
          $scope.motdExists = true;
          targetUrl ? $location.path(targetUrl) : "";
        }, function errorCallback(data) {
          $scope.submitDisabled = false;
          Alert.error($t('common.loginActivities.saveError'), data.data.message);
        });
      }
    };

    $scope.$on('$locationChangeStart', function(event, __targetUrl) {
      if( $scope.form.$dirty ){
        UnsavedDialog().then(function(action) {
          targetUrl = __targetUrl.split('#').pop();
          switch(action){
            case 'save':
              $scope.saveLoginMsg(targetUrl);
              break;
            case 'discard':
              $scope.form.$setPristine();
              $location.path(targetUrl);
              break;
            case 'cancel':
              targetUrl = '/loginActivities';
              break;
          }
        });
        event.preventDefault();
      }
    });

  }]);

  /**
   * Licensed to the Apache Software Foundation (ASF) under one
   * or more contributor license agreements.  See the NOTICE file
   * distributed with this work for additional information
   * regarding copyright ownership.  The ASF licenses this file
   * to you under the Apache License, Version 2.0 (the
   * "License"); you may not use this file except in compliance
   * with the License.  You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  'use strict';
  
  angular.module('ambariAdminConsole')
    .controller('HomeDirectoryCtrl', ['$scope', '$location', 'UnsavedDialog', function($scope, $location, UnsavedDialog) {

      $scope.TEMPLATE_PLACEHOLER = '/user/{{username}}';
      $scope.autoCreate = false;
      $scope.template = '';
      $scope.group = '';
      $scope.permissions = '';
  
      $scope.save = function (targetUrl) {
        targetUrl ? $location.path(targetUrl) : "";
      }
  
      $scope.$on('$locationChangeStart', function(event, __targetUrl) {
        if( $scope.form.$dirty ){
          UnsavedDialog().then(function(action) {
            var targetUrl = __targetUrl.split('#').pop();
            switch(action){
              case 'save':
                $scope.save(targetUrl);
                $scope.form.$setPristine();
                break;
              case 'discard':
                $scope.form.$setPristine();
                $location.path(targetUrl);
                break;
              case 'cancel':
                targetUrl = '/homeDirectory';
                break;
            }
          });
          event.preventDefault();
        }
      });
    }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('UsersCreateCtrl',['$scope', '$routeParams', 'User', '$location', 'Alert', 'UnsavedDialog', '$translate', function($scope, $routeParams, User, $location, Alert, UnsavedDialog, $translate) {
  var $t = $translate.instant;
  $scope.user = {
    active: true
  };
  var targetUrl = '/users';

  $scope.createUser = function() {
    $scope.form.submitted = true;
    if ($scope.form.$valid){
      User.create({
        'Users/user_name': $scope.user.user_name,
        'Users/password': $scope.user.password,
        'Users/active': !!$scope.user.active,
        'Users/admin': !!$scope.user.admin
      }).then(function() {
        Alert.success($t('users.alerts.userCreated', {
          userName: $scope.user.user_name,
          encUserName: encodeURIComponent($scope.user.user_name)
        }));
        $scope.form.$setPristine();
        $location.path(targetUrl);
      }).catch(function(data) {
        Alert.error($t('users.alerts.userCreationError'), data.data.message);
      });
    }
  };

  $scope.cancel = function() {
    $scope.form.$setPristine();
    $location.path('/users');
  };

  $scope.$on('$locationChangeStart', function(event, __targetUrl) {
        
    if( $scope.form.$dirty ){
      UnsavedDialog().then(function(action) {
        targetUrl = __targetUrl.split('#').pop();
        switch(action){
          case 'save':
            $scope.createUser();
            break;
          case 'discard':
            $scope.form.$setPristine();
            $location.path(targetUrl);
            break;
          case 'cancel':
          targetUrl = '/users';
            break;
        }
      });
      event.preventDefault();
    }
  });
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('UsersListCtrl',['$scope', 'User', '$modal', '$rootScope', 'UserConstants', '$translate', 'Settings', function($scope, User, $modal, $rootScope, UserConstants, $translate, Settings) {
  var $t = $translate.instant;
  $scope.constants = {
    admin: $t('users.ambariAdmin'),
    users: $t('common.users').toLowerCase()
  };
  $scope.users = [];
  $scope.usersPerPage = 10;
  $scope.currentPage = 1;
  $scope.totalUsers = 1;
  $scope.currentNameFilter = '';
  $scope.maxVisiblePages=20;
  $scope.tableInfo = {
    total: 0,
    showed: 0
  };
  $scope.isNotEmptyFilter = true;

  $scope.pageChanged = function() {
    $scope.loadUsers();
  };
  $scope.usersPerPageChanges = function() {
    $scope.resetPagination();
  };

  $scope.loadUsers = function(){
    User.list({
      currentPage: $scope.currentPage,
      usersPerPage: $scope.usersPerPage,
      searchString: $scope.currentNameFilter,
      user_type: $scope.currentTypeFilter.value,
      active: $scope.currentActiveFilter.value,
      admin: $scope.adminFilter
    }).then(function(data) {
      $scope.totalUsers = data.data.itemTotal;
      $scope.users = data.data.items.map(User.makeUser);
      $scope.tableInfo.showed = data.data.items.length;
      $scope.tableInfo.total = data.data.itemTotal;
    });
  };

  $scope.resetPagination = function() {
    $scope.currentPage = 1;
    $scope.loadUsers();
  };

  $scope.activeFilterOptions = [
    {label: $t('common.all'), value: '*'},
    {label: $t('users.active'), value: true},
    {label: $t('users.inactive'), value:false}
  ];
  $scope.currentActiveFilter = $scope.activeFilterOptions[0];

  $scope.typeFilterOptions = [{ label: $t('common.all'), value: '*'}]
    .concat(Object.keys(UserConstants.TYPES).map(function(key) {
      return {
        label: $t(UserConstants.TYPES[key].LABEL_KEY),
        value: UserConstants.TYPES[key].VALUE
      };
    }));

  $scope.currentTypeFilter = $scope.typeFilterOptions[0];

  $scope.adminFilter = false;
  $scope.toggleAdminFilter = function() {
    $scope.adminFilter = !$scope.adminFilter;
    $scope.resetPagination();
    $scope.loadUsers();
  };

  $scope.clearFilters = function () {
    $scope.currentNameFilter = '';
    $scope.currentTypeFilter = $scope.typeFilterOptions[0];
    $scope.currentActiveFilter = $scope.activeFilterOptions[0];
    $scope.adminFilter = false;
    $scope.resetPagination();
  };

  $scope.loadUsers();

  $scope.$watch(
    function (scope) {
      return Boolean(scope.currentNameFilter || (scope.currentActiveFilter && scope.currentActiveFilter.value !== '*')
        || (scope.currentTypeFilter && scope.currentTypeFilter.value !== '*') || $scope.adminFilter);
    },
    function (newValue, oldValue, scope) {
      scope.isNotEmptyFilter = newValue;
    }
  );

  $rootScope.$watch(function(scope) {
    return scope.LDAPSynced;
  }, function(LDAPSynced) {
    if(LDAPSynced === true){
      $rootScope.LDAPSynced = false;
      $scope.loadUsers();
    }
  });
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('UsersShowCtrl', ['$scope', '$routeParams', 'Cluster', 'User', 'View', '$modal', '$location', 'ConfirmationModal', 'Alert', 'Auth', 'getDifference', 'Group', '$q', 'UserConstants', '$translate', function($scope, $routeParams, Cluster, User, View, $modal, $location, ConfirmationModal, Alert, Auth, getDifference, Group, $q, UserConstants, $translate) {

  var $t = $translate.instant;

  $scope.constants = {
    user: $t('common.user'),
    status: $t('users.status'),
    admin: $t('users.admin'),
    password: $t('users.password'),
    view: $t('common.view').toLowerCase(),
    cluster: $t('common.cluster').toLowerCase()
  };

  function loadUserInfo(){
    User.get($routeParams.id).then(function(data) {
      $scope.user = User.makeUser(data).Users;
      $scope.isCurrentUser = $scope.user.user_name === Auth.getCurrentUser();
      $scope.editingGroupsList = angular.copy($scope.user.groups);
    });
  }

  loadUserInfo();
  $scope.user;
  $scope.isCurrentUser = true;
  $scope.dataLoaded = false;

  $scope.isGroupEditing = false;
  $scope.enableGroupEditing = function() {
    $scope.isGroupEditing = true;
    $scope.editingGroupsList = angular.copy($scope.user.groups);
  };

  $scope.$watch(function() {
    return $scope.editingGroupsList;
  }, function(newValue) {
    if(newValue){
      if( !angular.equals(newValue, $scope.user.groups) ){
        $scope.updateGroups();
      }
    }
  }, true);

  $scope.updateGroups = function() {
    var groups = $scope.editingGroupsList.toString().split(',').filter(function(item) {return item.trim();}).map(function(item) {return item.trim()});
    var diff = getDifference($scope.user.groups, groups);
    var promises = [];
    // Remove user from groups
    angular.forEach(diff.del, function(groupName) {
      promises.push(Group.removeMemberFromGroup(groupName, $scope.user.user_name).catch(function(data) {
        Alert.error($t('users.alerts.removeUserError'), data.data.message);
      }));
    });
    // Add user to groups
    angular.forEach(diff.add, function(groupName) {
      promises.push(Group.addMemberToGroup(groupName, $scope.user.user_name).catch(function(data) {
        Alert.error($t('users.alert.cannotAddUser'), data.data.message);
      }));
    });
    $q.all(promises).then(function() {
      loadUserInfo();
    });
    $scope.isGroupEditing = false;
  };

  $scope.getUserMembership = function(userType) {
    if(userType) {
	return $t(UserConstants.TYPES[userType].LABEL_KEY) + " " + $t('users.groupMembership');
    }
  };

  $scope.cancelUpdate = function() {
    $scope.isGroupEditing = false;
    $scope.editingGroupsList = '';
  };

  $scope.openChangePwdDialog = function() {
    var modalInstance = $modal.open({
      templateUrl: 'views/users/modals/changePassword.html',
      resolve: {
        userName: function() {
          return $scope.user.user_name;
        }
      },
      controller: ['$scope', 'userName', function($scope, userName) {
        $scope.passwordData = {
          password: '',
          currentUserPassword: ''
        };

        $scope.form = {};
        $scope.userName = userName;

        $scope.ok = function() {
          $scope.form.passwordChangeForm.submitted = true;
          if($scope.form.passwordChangeForm.$valid){

            modalInstance.close({
              password: $scope.passwordData.password, 
              currentUserPassword: $scope.passwordData.currentUserPassword
            });
          }
        };
        $scope.cancel = function() {
          modalInstance.dismiss('cancel');
        };
      }]
    });

    modalInstance.result.then(function(data) {
      User.setPassword($scope.user, data.password, data.currentUserPassword).then(function() {
        Alert.success($t('users.alerts.passwordChanged'));
      }).catch(function(data) {
        Alert.error($t('users.alerts.cannotChangePassword'), data.data.message);
      });
    }); 
  };

  $scope.toggleUserActive = function() {
    if(!$scope.isCurrentUser){
      var newStatusKey = $scope.user.active ? 'inactive' : 'active',
        newStatus = $t('users.' + newStatusKey).toLowerCase();
      ConfirmationModal.show(
        $t('users.changeStatusConfirmation.title'),
        $t('users.changeStatusConfirmation.message', {
          userName: $scope.user.user_name,
          status: newStatus
        })
      ).then(function() {
        User.setActive($scope.user.user_name, $scope.user.active);
      })
      .catch(function() {
        $scope.user.active = !$scope.user.active;
      });
    }
  };    
  $scope.toggleUserAdmin = function() {
    if(!$scope.isCurrentUser){
      var action = $scope.user.admin ? 'revoke' : 'grant';
      ConfirmationModal.show(
        $t('users.changePrivilegeConfirmation.title'),
        $t('users.changePrivilegeConfirmation.message', {
          action: action,
          userName: $scope.user.user_name
        })
      ).then(function() {
        User.setAdmin($scope.user.user_name, $scope.user.admin)
        .then(function() {
          loadPrivileges();
        });
      })
      .catch(function() {
        $scope.user.admin = !$scope.user.admin;
      });

    }
  };

  $scope.deleteUser = function() {
    ConfirmationModal.show(
      $t('common.delete', {
        term: $t('common.user')
      }),
      $t('common.deleteConfirmation', {
        instanceType: $t('common.user').toLowerCase(),
        instanceName: '"' + $scope.user.user_name + '"'
      })
    ).then(function() {
      Cluster.getPrivilegesForResource({
        nameFilter : $scope.user.user_name,
        typeFilter : {value: 'USER'}
      }).then(function(data) {
        var clusterPrivilegesIds = [];
        var viewsPrivileges = [];
        if (data.items && data.items.length) {
          angular.forEach(data.items[0].privileges, function(privilege) {
            if (privilege.PrivilegeInfo.principal_type === 'USER') {
              if (privilege.PrivilegeInfo.type === 'VIEW') {
                viewsPrivileges.push({
                  id: privilege.PrivilegeInfo.privilege_id,
                  view_name: privilege.PrivilegeInfo.view_name,
                  version: privilege.PrivilegeInfo.version,
                  instance_name: privilege.PrivilegeInfo.instance_name
                });
              } else {
                clusterPrivilegesIds.push(privilege.PrivilegeInfo.privilege_id);
              }
            }
          });
        }
        User.delete($scope.user.user_name).then(function() {
          $location.path('/users');
          if (clusterPrivilegesIds.length) {
            Cluster.getAllClusters().then(function (clusters) {
              var clusterName = clusters[0].Clusters.cluster_name;
              Cluster.deleteMultiplePrivileges(clusterName, clusterPrivilegesIds);
            });
          }
          angular.forEach(viewsPrivileges, function(privilege) {
            View.deletePrivilege(privilege);
          });
        });
      });
    });
  };

  // Load privileges
  function loadPrivileges(){
    User.getPrivileges($routeParams.id).then(function(data) {
      var privileges = {
        clusters: {},
        views: {}
      };
      angular.forEach(data.data.items, function(privilege) {
        privilege = privilege.PrivilegeInfo;
        if(privilege.type === 'CLUSTER'){
          // This is cluster
          if (privileges.clusters[privilege.cluster_name]) {
            var preIndex = Cluster.orderedRoles.indexOf(privileges.clusters[privilege.cluster_name].permission_name);
            var curIndex = Cluster.orderedRoles.indexOf(privilege.permission_name);
            // replace when cur is a more powerful role
            if (curIndex < preIndex) {
              privileges.clusters[privilege.cluster_name] = privilege;
            }
          } else {
            privileges.clusters[privilege.cluster_name] = privilege;
          }
        } else if ( privilege.type === 'VIEW'){
          privileges.views[privilege.instance_name] = privileges.views[privilege.instance_name] || { privileges:[]};
          privileges.views[privilege.instance_name].version = privilege.version;
          privileges.views[privilege.instance_name].view_name = privilege.view_name;
          if (privileges.views[privilege.instance_name].privileges.indexOf(privilege.permission_label) == -1) {
            privileges.views[privilege.instance_name].privileges.push(privilege.permission_label);
          }
        }
      });

      $scope.privileges = data.data.items.length ? privileges : null;
      $scope.noClusterPriv = $.isEmptyObject(privileges.clusters);
      $scope.noViewPriv = $.isEmptyObject(privileges.views);
      $scope.hidePrivileges = $scope.noClusterPriv && $scope.noViewPriv;
      $scope.dataLoaded = true;

    }).catch(function(data) {
      Alert.error($t('common.alerts.cannotLoadPrivileges'), data.data.message);
    });
  }
  loadPrivileges();
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('GroupsListCtrl',['$scope', 'Group', '$modal', 'ConfirmationModal', '$rootScope', 'GroupConstants', '$translate', function($scope, Group, $modal, ConfirmationModal, $rootScope, GroupConstants, $translate) {
  var $t = $translate.instant;
  $scope.constants = {
    groups: $t('common.groups').toLowerCase()
  };
  $scope.groups = [];

  $scope.groupsPerPage = 10;
  $scope.currentPage = 1;
  $scope.totalGroups = 1;
  $scope.currentNameFilter = '';
  $scope.maxVisiblePages=20;
  $scope.tableInfo = {
    total: 0,
    showed: 0
  };
  $scope.isNotEmptyFilter = true;

  $scope.pageChanged = function() {
    loadGroups();
  };
  $scope.groupsPerPageChanges = function() {
    loadGroups();
  };

  $scope.resetPagination = function() {
    $scope.currentPage = 1;
    loadGroups();
  };

  function loadGroups(){
    Group.all({
      currentPage: $scope.currentPage, 
      groupsPerPage: $scope.groupsPerPage, 
      searchString: $scope.currentNameFilter,
      group_type: $scope.currentTypeFilter.value
    }).then(function(groups) {
      $scope.totalGroups = groups.itemTotal;
      $scope.groups = groups.map(Group.makeGroup);
      $scope.tableInfo.total = groups.itemTotal;
      $scope.tableInfo.showed = groups.length;
    })
    .catch(function(data) {
      console.error($t('groups.alerts.getGroupsListError'));
    });
  }

  $scope.typeFilterOptions = [{ label: $t('common.all'), value: '*'}]
    .concat(Object.keys(GroupConstants.TYPES).map(function(key) {
      return {
        label: $t(GroupConstants.TYPES[key].LABEL_KEY),
        value: GroupConstants.TYPES[key].VALUE
      };
  }));
  $scope.currentTypeFilter = $scope.typeFilterOptions[0];

  $scope.clearFilters = function () {
    $scope.currentNameFilter = '';
    $scope.currentTypeFilter = $scope.typeFilterOptions[0];
    $scope.resetPagination();
  };
  
  loadGroups();

  $scope.$watch(
    function (scope) {
      return Boolean(scope.currentNameFilter || (scope.currentTypeFilter && scope.currentTypeFilter.value !== '*'));
    },
    function (newValue, oldValue, scope) {
      scope.isNotEmptyFilter = newValue;
    }
  );

  $rootScope.$watch(function(scope) {
    return scope.LDAPSynced;
  }, function(LDAPSynced) {
    if(LDAPSynced === true){
      $rootScope.LDAPSynced = false;
      loadGroups();
    }
  });

}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('GroupsCreateCtrl',['$scope', 'Group', '$location', 'Alert', 'UnsavedDialog', '$translate', function($scope, Group, $location, Alert, UnsavedDialog, $translate) {
  var $t = $translate.instant;
  $scope.group = new Group();
  var targetUrl = '/groups';

  $scope.createGroup = function() {
    $scope.form.submitted = true;
    if ($scope.form.$valid){
      $scope.group.save().then(function() {
        Alert.success($t('groups.alerts.groupCreated', {groupName: $scope.group.group_name}));
        $scope.form.$setPristine();
        $location.path(targetUrl);
      })
      .catch(function(data) {
        Alert.error($t('groups.alerts.groupCreationError'), data.data.message);
      });
    }
  };

  $scope.cancel = function() {
    $scope.form.$setPristine();
    $location.path('/groups');
  };

  $scope.$on('$locationChangeStart', function(event, __targetUrl) {
    if( $scope.form.$dirty ){
      UnsavedDialog().then(function(action) {
        targetUrl = __targetUrl.split('#').pop();
        switch(action){
          case 'save':
            $scope.createGroup();
            break;
          case 'discard':
            $scope.form.$setPristine();
            $location.path(targetUrl);
            break;
          case 'cancel':
            targetUrl = '/groups';
            break;
        }
      });
      event.preventDefault();
    }
  });
}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('GroupsEditCtrl',['$scope', 'Group', '$routeParams', 'Cluster', 'View', 'Alert', 'ConfirmationModal', '$location', 'GroupConstants', '$translate', function($scope, Group, $routeParams, Cluster, View, Alert, ConfirmationModal, $location, GroupConstants, $translate) {
  var $t = $translate.instant;
  $scope.constants = {
    group: $t('common.group'),
    view: $t('common.view').toLowerCase(),
    cluster: $t('common.cluster').toLowerCase()
  };
  $scope.editMode = false;
  $scope.group = new Group($routeParams.id);
  $scope.group.editingUsers = [];
  $scope.groupMembers = [];
  $scope.dataLoaded = false;
  
  $scope.isMembersEditing = false;

  $scope.$watch(function() {
    return $scope.group.editingUsers;
  }, function(newValue) {
    if(newValue && !angular.equals(newValue, $scope.groupMembers)){
      $scope.updateMembers();  
    }
  }, true);
  
  $scope.enableMembersEditing = function() {
    $scope.isMembersEditing = true;
    $scope.group.editingUsers = angular.copy($scope.groupMembers);
  };
  $scope.cancelUpdate = function() {
    $scope.isMembersEditing = false;
    $scope.group.editingUsers = '';
  };
  $scope.updateMembers = function() {
    var newMembers = $scope.group.editingUsers.toString().split(',').filter(function(item) {
      return item.trim();}
    ).map(function(item) {
        return item.trim()
      }
    );
    $scope.group.members = newMembers;
    $scope.group.saveMembers().catch(function(data) {
        Alert.error($t('groups.alerts.cannotUpdateGroupMembers'), "<div class='break-word'>" + data.message + "</div>");
      }).finally(function() {
        loadMembers();
      });
    $scope.isMembersEditing = false;
  };


  function loadMembers(){
    $scope.group.getMembers().then(function(members) {
      $scope.group.groupTypeName = $t(GroupConstants.TYPES[$scope.group.group_type].LABEL_KEY);
      $scope.groupMembers = members;
      $scope.group.editingUsers = angular.copy($scope.groupMembers);
    });
  }    
  
  $scope.group.isLDAP().then(function(isLDAP) {
    $scope.group.ldap_group = isLDAP;
    $scope.group.getGroupType().then(function() {
      $scope.group.groupTypeName = $t(GroupConstants.TYPES[$scope.group.group_type].LABEL_KEY);
    });
    loadMembers();
  });

  $scope.group.getGroupType();

  $scope.deleteGroup = function(group) {
    ConfirmationModal.show(
      $t('common.delete', {
        term: $t('common.group')
      }),
      $t('common.deleteConfirmation', {
        instanceType: $t('common.group').toLowerCase(),
        instanceName: '"' + group.group_name + '"'
      })
    ).then(function() {
      Cluster.getPrivilegesForResource({
        nameFilter : group.group_name,
        typeFilter : {value: 'GROUP'}
      }).then(function(data) {
        var clusterPrivilegesIds = [];
        var viewsPrivileges = [];
        if (data.items && data.items.length) {
          angular.forEach(data.items[0].privileges, function(privilege) {
            if (privilege.PrivilegeInfo.principal_type === 'GROUP') {
              if (privilege.PrivilegeInfo.type === 'VIEW') {
                viewsPrivileges.push({
                  id: privilege.PrivilegeInfo.privilege_id,
                  view_name: privilege.PrivilegeInfo.view_name,
                  version: privilege.PrivilegeInfo.version,
                  instance_name: privilege.PrivilegeInfo.instance_name
                });
              } else {
                clusterPrivilegesIds.push(privilege.PrivilegeInfo.privilege_id);
              }
            }
          });
        }
        group.destroy().then(function() {
          $location.path('/groups');
          if (clusterPrivilegesIds.length) {
            Cluster.getAllClusters().then(function (clusters) {
              var clusterName = clusters[0].Clusters.cluster_name;
              Cluster.deleteMultiplePrivileges(clusterName, clusterPrivilegesIds);
            });
          }
          angular.forEach(viewsPrivileges, function(privilege) {
            View.deletePrivilege(privilege);
          });
        });
      });
    });
  };

  // Load privileges
  Group.getPrivileges($routeParams.id).then(function(data) {
    var privileges = {
      clusters: {},
      views: {}
    };
    angular.forEach(data.data.items, function(privilege) {
      privilege = privilege.PrivilegeInfo;
      if(privilege.type === 'CLUSTER'){
        // This is cluster
        privileges.clusters[privilege.cluster_name] = privileges.clusters[privilege.cluster_name] || [];
        privileges.clusters[privilege.cluster_name].push(privilege.permission_label);
      } else if ( privilege.type === 'VIEW'){
        privileges.views[privilege.instance_name] = privileges.views[privilege.instance_name] || { privileges:[]};
        privileges.views[privilege.instance_name].version = privilege.version;
        privileges.views[privilege.instance_name].view_name = privilege.view_name;
        privileges.views[privilege.instance_name].privileges.push(privilege.permission_label);
      }
    });

    $scope.privileges = data.data.items.length ? privileges : null;
    $scope.noClusterPriv = $.isEmptyObject(privileges.clusters);
    $scope.noViewPriv = $.isEmptyObject(privileges.views);
    $scope.hidePrivileges = $scope.noClusterPriv && $scope.noViewPriv;    $scope.dataLoaded = true;
  }).catch(function(data) {
    Alert.error($t('common.alerts.cannotLoadPrivileges'), data.data.message);
  });


}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('ViewsListCtrl',['$scope', 'View','$modal', 'Alert', 'ConfirmationModal', '$location', '$translate', function($scope, View, $modal, Alert, ConfirmationModal, $location, $translate) {
  var deferredList = [],
    $t = $translate.instant;
  $scope.constants = {
    unable: $t('views.alerts.unableToCreate'),
    views: $t('common.views').toLowerCase()
  };
  $scope.$on('$locationChangeStart', function() {
    deferredList.forEach(function(def) {
      def.reject();
    })
  });

  $scope.createUrlDisabled = false;

  function checkViewVersionStatus(view, versionObj, versionNumber){
    var deferred = View.checkViewVersionStatus(view.view_name, versionNumber);
    deferredList.push(deferred);

    deferred.promise.then(function(status) {
      deferredList.splice(deferredList.indexOf(deferred), 1);
      if (status !== 'DEPLOYED' && status !== 'ERROR') {
        checkViewVersionStatus(view, versionObj, versionNumber);
      } else {
        $scope.$evalAsync(function() {
          versionObj.status = status;
          angular.forEach(view.versions, function(version) {
            if(version.status === 'DEPLOYED'){
              view.canCreateInstance = true;
            }
          })
        });
      }
    });
  }

  function loadViews(){
    View.all().then(function(views) {
      $scope.views = views;
      $scope.getFilteredViews();
      angular.forEach(views, function(view) {
        angular.forEach(view.versions, function(versionObj, versionNumber) {
          if (versionObj.status !== 'DEPLOYED' || versionObj.status !== 'ERROR'){
            checkViewVersionStatus(view, versionObj, versionNumber);
          }
        });
      })
    }).catch(function(data) {
      Alert.error($t('views.alerts.cannotLoadViews'), data.data.message);
    });
  }

  loadViews();

  $scope.createInstance = function(view) {
    var modalInstance = $modal.open({
      templateUrl: 'views/ambariViews/modals/create.html',
      size: 'lg',
      controller: 'CreateViewInstanceCtrl',
      resolve: {
        viewVersion: function(){
          return view.versionsList[ view.versionsList.length-1];
        }
      }
    });

    modalInstance.result.then(loadViews);
  };

  $scope.viewsFilter = '';
  $scope.filteredViews = [];
  $scope.getFilteredViews = function(views) {
    var result = [];
    var filter = $scope.viewsFilter.toLowerCase();
    if(!filter){  // if no filter return all views
      result = $scope.views.map(function(view) {
        view.isOpened = false;
        return view;
      });
    } else {
      result = $scope.views.map(function(view) {
        view.isOpened = true;
        if(view.view_name.toLowerCase().indexOf(filter) >= 0){
          return view; // if filter matched with view name -- return whole view
        } else {
          var instances = [];
          angular.forEach(view.instances, function(instance) {
            if(instance.ViewInstanceInfo.label.toLowerCase().indexOf(filter) >= 0){
              instances.push(instance);
            }
          });
          if( instances.length ){ // If inside view exists instances with matched filter - show only this instances
            var v = angular.copy(view);
            v.instances = instances;
            return v;
          }
        }
      }).filter(function(view) {
        return !!view; // Remove 'undefined'
      });
    }
    $scope.filteredViews = result;
  };

  $scope.gotoCreate = function(viewName, isAllowed) {
    if(isAllowed){
      $location.path('/views/'+viewName+'/new');
    }
  };

  $scope.reloadViews = function () {
    loadViews();
  };

  /**
   * Url listing
   */

  $scope.loadedUrls = [];
  $scope.urlsPerPage = 10;
  $scope.currentPage = 1;
  $scope.totalUrls = 1;
  $scope.urlNameFilter = '';
  $scope.urlSuffixfilter = '';
  $scope.maxVisiblePages=20;
  $scope.tableInfo = {
    total: 0,
    showed: 0
  };

  $scope.isNotEmptyFilter = true;


  $scope.pageChanged = function() {
    $scope.listViewUrls();
  };

  $scope.urlsPerPageChanged = function() {
    $scope.resetPagination();
  };


  $scope.resetPagination = function() {
    $scope.currentPage = 1;
    $scope.listViewUrls();
  };


  $scope.getVersions = function(instances) {
    var names = [];

    instances.map(function(view){
      var name = view.view_name;
      names.push(name);
    });

    var output = [],
        keys = [];

    angular.forEach(names, function(item) {
      var key = item;
      if(keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(item);
      }
    });
    return output;
    };



  $scope.clearFilters = function () {
    $scope.urlNameFilter = '';
    $scope.urlSuffixfilter = '';
    $scope.instanceTypeFilter = $scope.typeFilterOptions[0];
    $scope.resetPagination();
  };



  $scope.$watch(
      function (scope) {
        return Boolean(scope.urlNameFilter || scope.urlSuffixfilter || (scope.instanceTypeFilter && scope.instanceTypeFilter.value !== '*'));
      },
      function (newValue, oldValue, scope) {
        scope.isNotEmptyFilter = newValue;
      }
  );




  $scope.listViewUrls = function(){
    View.allUrls({
      currentPage: $scope.currentPage,
      urlsPerPage: $scope.urlsPerPage,
      searchString: $scope.urlNameFilter,
      suffixSearch: $scope.urlSuffixfilter,
      instanceType: $scope.instanceTypeFilter?$scope.instanceTypeFilter.value:'*'
    }).then(function(urls) {
      $scope.urls = urls;
      $scope.ViewNameFilterOptions = urls.items.map(function(url){
        return url.ViewUrlInfo.view_instance_common_name;
      });

      $scope.totalUrls = urls.itemTotal;
      $scope.tableInfo.showed = urls.items.length;
      $scope.tableInfo.total = urls.itemTotal;

      // get all view instances to enable/disable creation if empty

    }).catch(function(data) {
      Alert.error($t('views.alerts.cannotLoadViewUrls'), data.message);
    });
  };


  $scope.initViewUrls = function(){
    $scope.listViewUrls();
    View.getAllVisibleInstance().then(function(instances){
      // if no instances then disable the create button
      if(!instances.length){
        $scope.createUrlDisabled = true;
      } else {
        $scope.typeFilterOptions = [{ label: $t('common.all'), value: '*'}]
            .concat($scope.getVersions(instances).map(function(key) {
              return {
                label: key,
                value: key
              };
            }));

        $scope.instanceTypeFilter = $scope.typeFilterOptions[0];
      }

    }).catch(function(data) {
      // Make the create button enabled, and swallow the error
      $scope.createUrlDisabled = false;
    });

  };

}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('ViewsEditCtrl', ['$scope','$route', '$templateCache', '$routeParams', 'RemoteCluster', 'Cluster', 'View', 'Alert', 'PermissionLoader', 'PermissionSaver', 'ConfirmationModal', '$location', 'UnsavedDialog', '$translate', function($scope, $route, $templateCache , $routeParams, RemoteCluster, Cluster, View, Alert, PermissionLoader, PermissionSaver, ConfirmationModal, $location, UnsavedDialog, $translate) {
    var $t = $translate.instant;
    $scope.identity = angular.identity;
    $scope.isConfigurationEmpty = true;
    $scope.isSettingsEmpty = true;
    $scope.permissionRoles = View.permissionRoles;
    $scope.constants = {
      instance: $t('views.instance'),
      props: $t('views.properties'),
      perms: $t('views.permissions').toLowerCase()
    };

    function reloadViewInfo(section){
      // Load instance data, after View permissions meta loaded
      View.getInstance($routeParams.viewId, $routeParams.version, $routeParams.instanceId)
        .then(function(instance) {
          $scope.instance = instance;
          $scope.viewUrl = instance.ViewInstanceInfo.view_name + '/' + instance.ViewInstanceInfo.version + '/' + instance.ViewInstanceInfo.instance_name;
          $scope.settings = {
            'visible': $scope.instance.ViewInstanceInfo.visible,
            'label': $scope.instance.ViewInstanceInfo.label,
            'description': $scope.instance.ViewInstanceInfo.description,
            'shortUrl': $scope.instance.ViewInstanceInfo.short_url,
            'shortUrlName': $scope.instance.ViewInstanceInfo.short_url_name
          };
          switch (section) {
            case "details" :
              initConfigurations();
              initCtrlVariables(instance);
              break;
            case "settings" :
              initConfigurations(true);
              break;
            case "cluster" :
              initCtrlVariables(instance);
              break;
          }
        })
        .catch(function(data) {
          Alert.error($t('views.alerts.cannotLoadInstanceInfo'), data.data.message);
        });

    }

    function initCtrlVariables(instance) {
       $scope.data.clusterType = instance.ViewInstanceInfo.cluster_type;
       var clusterId = instance.ViewInstanceInfo.cluster_handle;
       if (!clusterId) $scope.data.clusterType = 'NONE';
       switch($scope.data.clusterType) {
          case 'LOCAL_AMBARI':
            $scope.cluster = null;
            $scope.clusters.forEach(function(cluster){
              if(cluster.id == clusterId){
                $scope.cluster = cluster;
              }
            })
            break;
          case 'REMOTE_AMBARI':
            $scope.data.remoteCluster = null;
            $scope.remoteClusters.forEach(function(cluster){
              if(cluster.id == clusterId){
                $scope.data.remoteCluster = cluster;
              }
            })
            break;
       }

      $scope.originalClusterType = $scope.data.clusterType;
      $scope.isConfigurationEmpty = !$scope.numberOfClusterConfigs;
      $scope.isSettingsEmpty = !$scope.numberOfSettingsConfigs;
    }

    function isClusterConfig(name) {
      var configurationMeta = $scope.configurationMeta;
      var clusterConfigs = configurationMeta.filter(function(el) {
        return el.clusterConfig;
      }).map(function(el) {
        return el.name;
      });
      return clusterConfigs.indexOf(name) !== -1;
    }

    function initConfigurations(initClusterConfig) {
      var initAllConfigs = !initClusterConfig;
      var configuration = angular.copy($scope.instance.ViewInstanceInfo.properties);
      if (initAllConfigs) {
        $scope.configuration = angular.copy($scope.instance.ViewInstanceInfo.properties);
      }
      for (var confName in configuration) {
        if (configuration.hasOwnProperty(confName)) {
          if (!isClusterConfig(confName) || initAllConfigs) {
            $scope.configuration[confName] = configuration[confName] === 'null' ? '' : configuration[confName];
          }
        }
      }
    }

    function filterClusterConfigs() {
      $scope.configurationMeta.forEach(function (element) {
        if (element.masked && !$scope.editConfigurationDisabled && element.clusterConfig && $scope.data.clusterType == 'NONE') {
          $scope.configuration[element.name] = '';
        }
        if(!element.clusterConfig) {
          delete $scope.configurationBeforeEdit[element.name];
        }
      });
    }

    // Get META for properties
    View.getMeta($routeParams.viewId, $routeParams.version).then(function(data) {
      $scope.configurationMeta = data.data.ViewVersionInfo.parameters;
      $scope.clusterConfigurable = data.data.ViewVersionInfo.cluster_configurable;
      $scope.clusterConfigurableErrorMsg = $scope.clusterConfigurable ? "" : $t('views.alerts.cannotUseOption');
      angular.forEach($scope.configurationMeta, function (item) {
        item.displayName = item.name.replace(/\./g, '\.\u200B');
        item.clusterConfig = !!item.clusterConfig;
        if (!item.clusterConfig) {
          $scope.numberOfSettingsConfigs++;
        }
        $scope.numberOfClusterConfigs = $scope.numberOfClusterConfigs + !!item.clusterConfig;
      });
      reloadViewInfo("details");
    });

    function reloadViewPrivileges(){
      PermissionLoader.getViewPermissions({
          viewName: $routeParams.viewId,
          version: $routeParams.version,
          instanceId: $routeParams.instanceId
        })
        .then(function(permissions) {
          // Refresh data for rendering
          $scope.permissionsEdit = permissions;
          $scope.permissions = angular.copy(permissions);
          $scope.isPermissionsEmpty = angular.equals({}, $scope.permissions);
        })
        .catch(function(data) {
          Alert.error($t('views.alerts.cannotLoadPermissions'), data.data.message);
        });
    }

    $scope.permissions = [];

    reloadViewPrivileges();

    $scope.clusterConfigurable = false;
    $scope.clusterConfigurableErrorMsg = "";
    $scope.clusters = [];
    $scope.remoteClusters = [];
    $scope.cluster = null;
    $scope.noLocalClusterAvailible = true;
    $scope.noRemoteClusterAvailible = true;
    $scope.data = {};
    $scope.data.remoteCluster = null;
    $scope.data.clusterType = 'NONE';

    $scope.editSettingsDisabled = true;
    $scope.editDetailsSettingsDisabled = true;
    $scope.numberOfClusterConfigs = 0;
    $scope.numberOfSettingsConfigs = 0;

    $scope.enableLocalCluster = function() {
      angular.extend($scope.configuration, $scope.configurationBeforeEdit);
      $scope.propertiesForm.$setPristine();
    };

    $scope.disableLocalCluster = function() {
      filterClusterConfigs();
    };

    $scope.toggleSettingsEdit = function() {
      $scope.editSettingsDisabled = !$scope.editSettingsDisabled;
      $scope.settingsBeforeEdit = angular.copy($scope.configuration);
      $scope.configurationMeta.forEach(function (element) {
        if (element.masked && !$scope.editSettingsDisabled && !element.clusterConfig) {
          $scope.configuration[element.name] = '';
        }
        if(element.clusterConfig) {
          delete $scope.settingsBeforeEdit[element.name];
        }
      });
    };

    $scope.toggleDetailsSettingsEdit = function() {
      $scope.editDetailsSettingsDisabled = !$scope.editDetailsSettingsDisabled;
      $scope.settingsBeforeEdit = angular.copy($scope.configuration);
      $scope.configurationMeta.forEach(function (element) {
        if (element.masked && !$scope.editDetailsSettingsDisabled && !element.clusterConfig) {
          $scope.configuration[element.name] = '';
        }
        if(element.clusterConfig) {
          delete $scope.settingsBeforeEdit[element.name];
        }
      });
    };

    Cluster.getAllClusters().then(function (clusters) {
      if(clusters.length >0){
        clusters.forEach(function(cluster) {
          $scope.clusters.push({
            "name" : cluster.Clusters.cluster_name,
            "id" : cluster.Clusters.cluster_id
          })
        });
        $scope.noLocalClusterAvailible = false;
      }else{
        $scope.clusters.push($t('common.noClusters'));
      }
      $scope.cluster = $scope.clusters[0];
    });

    loadRemoteClusters();

    function loadRemoteClusters() {
      RemoteCluster.listAll().then(function (clusters) {
        if(clusters.length >0){
          clusters.forEach(function(cluster) {
            $scope.remoteClusters.push({
              "name" : cluster.ClusterInfo.name,
              "id" : cluster.ClusterInfo.cluster_id
            })
          });
          $scope.noRemoteClusterAvailible = false;
          }else{
            $scope.remoteClusters.push($t('common.noClusters'));
          }
          $scope.data.remoteCluster = $scope.remoteClusters[0];
       });
     }


    $scope.saveSettings = function(callback) {
      if( $scope.settingsForm.$valid ){
        var data = {
          'ViewInstanceInfo':{
            'properties':{}
          }
        };
        $scope.configurationMeta.forEach(function (element) {
          if(!element.clusterConfig) {
            data.ViewInstanceInfo.properties[element.name] = $scope.configuration[element.name];
          }
        });
        return View.updateInstance($routeParams.viewId, $routeParams.version, $routeParams.instanceId, data)
          .success(function() {
            if( callback ){
              callback();
            } else {
              reloadViewInfo("settings");
              $scope.editSettingsDisabled = true;
              $scope.settingsForm.$setPristine();
            }
          })
          .catch(function(data) {
            Alert.error($t('views.alerts.cannotSaveSettings'), data.data.message);
          });
      }
    };
    $scope.cancelSettings = function() {
      angular.extend($scope.configuration, $scope.settingsBeforeEdit);

      $scope.editSettingsDisabled = true;
      $scope.settingsForm.$setPristine();
    };

    $scope.saveDetails = function(callback) {
      if( $scope.detailsForm.$valid ){
        var data = {
          'ViewInstanceInfo':{
            'visible': $scope.settings.visible,
            'label': $scope.settings.label,
            'description': $scope.settings.description
          }
        };
        return View.updateInstance($routeParams.viewId, $routeParams.version, $routeParams.instanceId, data)
          .success(function() {
            $scope.$root.$emit('instancesUpdate');
            if( callback ){
              callback();
            } else {
              reloadViewInfo("cluster");
              $scope.editDetailsSettingsDisabled = true;
              $scope.settingsForm.$setPristine();
            }
          })
          .catch(function(data) {
            Alert.error($t('views.alerts.cannotSaveSettings'), data.data.message);
          });
      }
    };
    $scope.cancelDetails = function() {
      $scope.settings = {
        'visible': $scope.instance.ViewInstanceInfo.visible,
        'label': $scope.instance.ViewInstanceInfo.label,
        'description': $scope.instance.ViewInstanceInfo.description,
        'shortUrl': $scope.instance.ViewInstanceInfo.short_url,
        'shortUrlName': $scope.instance.ViewInstanceInfo.short_url_name
      };
      $scope.editDetailsSettingsDisabled = true;
      $scope.settingsForm.$setPristine();
    };


    $scope.editConfigurationDisabled = true;
    $scope.togglePropertiesEditing = function () {
      $scope.editConfigurationDisabled = !$scope.editConfigurationDisabled;
      $scope.configurationBeforeEdit = angular.copy($scope.configuration);
      filterClusterConfigs();
    };
    $scope.saveConfiguration = function() {
      if( $scope.propertiesForm.$valid ){
        var data = {
          'ViewInstanceInfo':{
            'properties':{}
          }
        };

        data.ViewInstanceInfo.cluster_type = $scope.data.clusterType;

        switch($scope.data.clusterType) {
          case 'LOCAL_AMBARI':
            data.ViewInstanceInfo.cluster_handle = $scope.cluster.id;
            break;
          case 'REMOTE_AMBARI':
            data.ViewInstanceInfo.cluster_handle = $scope.data.remoteCluster.id;
            break;
            break;
          default :
            data.ViewInstanceInfo.cluster_handle = null;
            $scope.configurationMeta.forEach(function (element) {
              if(element.clusterConfig) {
                data.ViewInstanceInfo.properties[element.name] = $scope.configuration[element.name];
              }
            });
            $scope.removeAllRolePermissions();

          }

        $scope.originalClusterType = $scope.data.clusterType;
        return View.updateInstance($routeParams.viewId, $routeParams.version, $routeParams.instanceId, data)
          .success(function() {
            $scope.editConfigurationDisabled = true;
            $scope.propertiesForm.$setPristine();
          })
          .catch(function(data) {
            var errorMessage = data.data.message;

            //TODO: maybe the BackEnd should sanitize the string beforehand?
            errorMessage = errorMessage.substr(errorMessage.indexOf("\{"));

            if (data.status >= 400 && $scope.data.clusterType == 'NONE') {
              try {
                var errorObject = JSON.parse(errorMessage);
                errorMessage = errorObject.detail;
                angular.forEach(errorObject.propertyResults, function (item, key) {
                  $scope.propertiesForm[key].validationError = !item.valid;
                  if (!item.valid) {
                    $scope.propertiesForm[key].validationMessage = item.detail;
                  }
                });
              } catch (e) {
                console.error($t('views.alerts.unableToParseError', {message: data.message}));
              }
            }
            Alert.error($t('views.alerts.cannotSaveProperties'), errorMessage);
          });
      }
    };
    $scope.cancelConfiguration = function() {
      angular.extend($scope.configuration, $scope.configurationBeforeEdit);
      $scope.data.clusterType = $scope.originalClusterType;
      $scope.editConfigurationDisabled = true;
      $scope.propertiesForm.$setPristine();
    };

    // Permissions edit
    $scope.editPermissionDisabled = true;
    $scope.cancelPermissions = function() {
      $scope.permissionsEdit = angular.copy($scope.permissions); // Reset textedit areaes
      $scope.editPermissionDisabled = true;
    };

    $scope.savePermissions = function() {
      $scope.editPermissionDisabled = true;
      return PermissionSaver.saveViewPermissions(
        $scope.permissionsEdit,
        {
          view_name: $routeParams.viewId,
          version: $routeParams.version,
          instance_name: $routeParams.instanceId
        }
        )
        .then(reloadViewPrivileges)
        .catch(function(data) {
          reloadViewPrivileges();
          Alert.error($t('common.alerts.cannotSavePermissions'), data.data.message);
        });
    };

    $scope.removeAllRolePermissions = function() {
      angular.forEach(View.permissionRoles, function(key) {
        $scope.permissionsEdit["VIEW.USER"]["ROLE"][key] = false;
      })
    };

    $scope.$watch(function() {
      return $scope.permissionsEdit;
    }, function(newValue, oldValue) {
      if(newValue && oldValue != undefined) {
        $scope.savePermissions();
      }
    }, true);



    $scope.deleteInstance = function(instance) {
      ConfirmationModal.show(
        $t('common.delete', {
          term: $t('views.viewInstance')
        }),
        $t('common.deleteConfirmation', {
          instanceType: $t('views.viewInstance'),
          instanceName: instance.ViewInstanceInfo.label
        })
      ).then(function() {
        View.deleteInstance(instance.ViewInstanceInfo.view_name, instance.ViewInstanceInfo.version, instance.ViewInstanceInfo.instance_name)
          .then(function() {
            $location.path('/views');
          })
          .catch(function(data) {
            Alert.error($t('views.alerts.cannotDeleteInstance'), data.data.message);
          });
      });
    };

    $scope.deleteShortURL = function(shortUrlName) {
      ConfirmationModal.show(
        $t('common.delete', {
          term: $t('urls.url')
        }),
        $t('common.deleteConfirmation', {
          instanceType: $t('urls.url').toLowerCase(),
          instanceName: '"' + shortUrlName + '"'
        })
      ).then(function() {
        View.deleteUrl(shortUrlName).then(function() {
          var currentPageTemplate = $route.current.templateUrl;
          $templateCache.remove(currentPageTemplate);
          $route.reload();
        });
      });
    };

    $scope.$on('$locationChangeStart', function(event, targetUrl) {
      if( $scope.settingsForm.$dirty || $scope.propertiesForm.$dirty){
        UnsavedDialog().then(function(action) {
          targetUrl = targetUrl.split('#').pop();
          switch(action){
            case 'save':
              if($scope.settingsForm.$valid &&  $scope.propertiesForm.$valid ){
                $scope.saveSettings(function() {
                  $scope.saveConfiguration().then(function() {
                    $scope.propertiesForm.$setPristine();
                    $scope.settingsForm.$setPristine();
                    $location.path(targetUrl);
                  });
                });
              }
              break;
            case 'discard':
              $scope.propertiesForm.$setPristine();
              $scope.settingsForm.$setPristine();
              $location.path(targetUrl);
              break;
            case 'cancel':
              targetUrl = '';
              break;
          }
        });
        event.preventDefault();
      }
    });

    $scope.checkAllRoles = function () {
      setAllViewRoles(true);
    };

    $scope.clearAllRoles = function () {
      setAllViewRoles(false);
    };

    function setAllViewRoles(value) {
      var viewRoles = $scope.permissionsEdit["VIEW.USER"]["ROLE"];
      for (var role in viewRoles) {
        $scope.permissionsEdit["VIEW.USER"]["ROLE"][role] = value;
      }
    }
  }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('ViewUrlCtrl',['$scope', 'View', 'Alert', 'Cluster', '$routeParams', '$location', 'UnsavedDialog', '$translate', 'Settings', function($scope, View, Alert, Cluster, $routeParams, $location, UnsavedDialog, $translate, Settings) {
  var $t = $translate.instant;
  $scope.form = {};
  $scope.constants = {
    props: $t('views.properties')
  };
  var targetUrl = '/viewUrls';

  $scope.url={};
  $scope.formHolder = {};
  $scope.stepOneNotCompleted = true;
  $scope.stepTwoNotCompleted = true;

  View.getAllVisibleInstance().then(function(views) {
    var names = [];
    var instances=[];
    views.map(function(view){
      var nameVersion = view.view_name+" {"+view.version+"}";
        names.push(nameVersion);
      instances.push({nameV:nameVersion,instance:view.instance_name,cname:view.view_name,version:view.version});
    });

    var output = [],
        keys = [];

    angular.forEach(names, function(item) {
      var key = item;
      if(keys.indexOf(key) === -1) {
        keys.push(key);
        output.push(item);
      }
    });

    $scope.viewsVersions =  output;
    $scope.viewInstances =  instances;

    if($routeParams.viewName && $routeParams.viewVersion && $routeParams.viewInstanceName){
      var selectedView = $routeParams.viewName+" {"+$routeParams.viewVersion+"}";
      $scope.url.selectedView = selectedView;
      $scope.url.selectedInstance = instances.find(function(inst){
         return inst.nameV === selectedView && inst.instance === $routeParams.viewInstanceName && inst.version === $routeParams.viewVersion && inst.cname === $routeParams.viewName;
      });
      $scope.stepOneNotCompleted = false;
      $scope.stepTwoNotCompleted = false;
    }

  }).catch(function(data) {
    Alert.error($t('views.alerts.cannotLoadViews'), data.data.message);
  });

  $scope.filterByName = function(nameV){
    return function (item) {
      if (item.nameV === nameV)
      {
        return true;
      }
      return false;
    };
  };

  $scope.chomp = function(viewNameVersion){
    if(viewNameVersion) {
      return viewNameVersion.substr(0, viewNameVersion.indexOf("{")).trim();
    }
  };


  $scope.doStepOne = function () {
    $scope.stepOneNotCompleted = false;
  };


  $scope.doStepTwo = function () {
    $scope.stepTwoNotCompleted = false;

  };

  $scope.cancelForm = function () {
    $scope.stepOneNotCompleted = true;
    $scope.stepTwoNotCompleted = true;
  };

  $scope.saveUrl = function() {
    $scope.formHolder.form.submitted = true;

    if($scope.formHolder.form.$valid){

      var payload = {ViewUrlInfo:{
        url_name:$scope.url.urlName,
        url_suffix:$scope.url.suffix,
        view_instance_version:$scope.url.selectedInstance.version,
        view_instance_name:$scope.url.selectedInstance.instance,
        view_instance_common_name:$scope.url.selectedInstance.cname
      }};

      View.updateShortUrl(payload).then(function(urlStatus) {
        Alert.success($t('urls.urlCreated', {
          siteRoot: Settings.siteRoot,
          viewName:$scope.url.selectedInstance.cname ,
          shortUrl:$scope.url.suffix,
          urlName:$scope.url.urlName
        }));
        $scope.formHolder.form.$setPristine();
        $scope.url={};
        $scope.formHolder = {};
        $scope.stepOneNotCompleted = true;
        $scope.stepTwoNotCompleted = true;
        $location.path(targetUrl);
      }).catch(function(data) {
        Alert.error($t('views.alerts.cannotLoadViewUrls'), data.message);
      });

    }
  };

}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('ViewUrlEditCtrl',['$scope', 'View', 'Alert', 'Cluster', '$routeParams', '$location', 'UnsavedDialog', '$translate','ConfirmationModal', 'Settings' ,function($scope, View, Alert, Cluster, $routeParams, $location, UnsavedDialog, $translate,ConfirmationModal, Settings) {
  var $t = $translate.instant;
  $scope.form = {};
  $scope.constants = {
    props: $t('views.properties')
  };
  var targetUrl = '/viewUrls';


  function setUpEdit(){

      View.getUrlInfo($routeParams.urlName).then(function(url) {
        $scope.url = url.ViewUrlInfo;
        $scope.nameVersion = url.ViewUrlInfo.view_instance_common_name +" {" + url.ViewUrlInfo.view_instance_version +"}"
      }).catch(function(data) {
        Alert.error($t('views.alerts.cannotLoadViewUrl'), data.data.message);
      });
  }

  setUpEdit();


  $scope.updateUrl = function() {
      $scope.url_form.submitted = true;

      if($scope.url_form.$valid){

          var payload = {ViewUrlInfo:{
              url_name:$scope.url.url_name,
              url_suffix:$scope.url.url_suffix,
              view_instance_version:'',
              view_instance_name:'',
              view_instance_common_name:''
          }};

          View.editShortUrl(payload).then(function(urlStatus) {
              Alert.success($t('urls.urlUpdated', {
                  siteRoot: Settings.siteRoot,
                  viewName:$scope.url.view_instance_common_name ,
                  shortUrl:$scope.url.suffix,
                  urlName:$scope.url.url_name
              }));
              $scope.url_form.$setPristine();
              $location.path(targetUrl);
          }).catch(function(data) {
              Alert.error($t('views.alerts.cannotLoadViewUrls'), data.data.message);
          });

      }
  };


    $scope.deleteUrl = function() {

        ConfirmationModal.show(
            $t('common.delete', {
                term: $t('urls.url')
            }),
            $t('common.deleteConfirmation', {
                instanceType: $t('urls.url').toLowerCase(),
                instanceName: '"' + $scope.url.url_name + '"'
            })
        ).then(function() {
            View.deleteUrl($scope.url.url_name).then(function() {
                $location.path(targetUrl);
            });
        });



    };



}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('CreateViewInstanceCtrl',['$scope', 'View','RemoteCluster' , 'Alert', 'Cluster', '$routeParams', '$location', 'UnsavedDialog', '$translate', function($scope, View, RemoteCluster, Alert, Cluster, $routeParams, $location, UnsavedDialog, $translate) {
  var $t = $translate.instant;
  $scope.form = {};
  $scope.constants = {
    props: $t('views.properties')
  };
  var targetUrl = '';

  function loadMeta(){
    View.getMeta($routeParams.viewId, $scope.version).then(function(data) {
      var viewVersion = data.data,
        parameters;

      $scope.view = viewVersion;
      parameters = viewVersion.ViewVersionInfo.parameters;

      angular.forEach(parameters, function (item) {
        item.value = item['defaultValue'];
        item.clusterConfig = !!item.clusterConfig;
        item.displayName = item.name.replace(/\./g, '\.\u200B');
        item.clusterConfig ? $scope.numberOfClusterConfigs++ : $scope.numberOfSettingConfigs++;
      });

      $scope.clusterConfigurable = viewVersion.ViewVersionInfo.cluster_configurable;
      $scope.clusterConfigurableErrorMsg = $scope.clusterConfigurable ? "" : $t('views.alerts.cannotUseOption');

      $scope.instance = {
        view_name: viewVersion.ViewVersionInfo.view_name,
        version: viewVersion.ViewVersionInfo.version,
        instance_name: '',
        label: '',
        visible: true,
        icon_path: '',
        icon64_path: '',
        properties: parameters,
        description: '',
        clusterType: 'NONE'
      };
      loadClusters();
      loadRemoteClusters();
    });
  }


  $scope.$watch(function(scope) {
    return scope.version;
  }, function(version) {
    if( version ){
      loadMeta();
    }
  });

  $scope.enableLocalCluster = function () {
    if($scope.errorKeys.length > 0) {
      $scope.errorKeys.forEach( function (key) {
        try {
          $scope.form.instanceCreateForm[key].validationError = false;
          $scope.form.instanceCreateForm[key].validationMessage = '';
        } catch (e) {
          console.log($t('views.alerts.unableToResetErrorMessage', {key: key}));
        }
      });
      $scope.errorKeys = [];
    }
  };

  // $scope.view = viewVersion;
  $scope.isAdvancedClosed = true;
  $scope.instanceExists = false;
  $scope.errorKeys = [];

  $scope.clusterConfigurable = false;
  $scope.clusterConfigurableErrorMsg = "";
  $scope.clusters = [];
  $scope.remoteClusters = [];
  $scope.noLocalClusterAvailible = true;
  $scope.noRemoteClusterAvailible = true;
  $scope.cluster = null;
  $scope.data = {};
  $scope.data.remoteCluster = null;
  $scope.numberOfClusterConfigs = 0;
  $scope.numberOfSettingConfigs = 0;

  function loadClusters() {
       Cluster.getAllClusters().then(function (clusters) {
         if(clusters.length >0){
           clusters.forEach(function(cluster) {
             $scope.clusters.push({
              "name" : cluster.Clusters.cluster_name,
              "id" : cluster.Clusters.cluster_id
             })
           });
           $scope.noLocalClusterAvailible = false;
           if($scope.clusterConfigurable){
             $scope.instance.clusterType = "LOCAL_AMBARI";
           }
         }else{
           $scope.clusters.push($t('common.noClusters'));
         }
         $scope.cluster = $scope.clusters[0];
       });
  }

   function loadRemoteClusters() {
         RemoteCluster.listAll().then(function (clusters) {
           if(clusters.length >0){
             clusters.forEach(function(cluster) {
               $scope.remoteClusters.push({
                "name" : cluster.ClusterInfo.name,
                "id" : cluster.ClusterInfo.cluster_id
               })
             });
             $scope.noRemoteClusterAvailible = false;
           }else{
             $scope.remoteClusters.push($t('common.noClusters'));
           }
           $scope.data.remoteCluster = $scope.remoteClusters[0];
         });
   }


  $scope.versions = [];
  $scope.version = null;

  View.getVersions($routeParams.viewId).then(function(versions) {
    $scope.versions = versions;
    $scope.version = $scope.versions[$scope.versions.length-1];
  });


  $scope.nameValidationPattern = /^\s*\w*\s*$/;

  $scope.save = function() {
  if (!$scope.form.instanceCreateForm.isSaving) {
    $scope.form.instanceCreateForm.submitted = true;
    if($scope.form.instanceCreateForm.$valid){
      $scope.form.instanceCreateForm.isSaving = true;

      switch($scope.instance.clusterType) {
        case 'LOCAL_AMBARI':
          console.log($scope.cluster);
          $scope.instance.clusterId = $scope.cluster.id;
          break;
        case 'REMOTE_AMBARI':
          console.log($scope.data.remoteCluster);
          $scope.instance.clusterId = $scope.data.remoteCluster.id;

          break;
        default:
          $scope.instance.clusterId = null;
      }
      console.log($scope.instance.clusterId);
      View.createInstance($scope.instance)
        .then(function(data) {
          Alert.success($t('views.alerts.instanceCreated', {instanceName: $scope.instance.instance_name}));
          $scope.form.instanceCreateForm.$setPristine();
          if( targetUrl ){
            $location.path(targetUrl);
          } else {
            $location.path('/views/' + $scope.instance.view_name + '/versions/' + $scope.instance.version + '/instances/' + $scope.instance.instance_name + '/edit');
          }
            $scope.form.instanceCreateForm.isSaving = false;
            $scope.$root.$emit('instancesUpdate');
        })
        .catch(function (data) {
          var errorMessage = data.message;
          var showGeneralError = true;

          if (data.status >= 400 && $scope.instance.clusterType == 'NONE') {
            try {
              var errorObject = JSON.parse(errorMessage);
              errorMessage = errorObject.detail;
              angular.forEach(errorObject.propertyResults, function (item, key) {
                $scope.form.instanceCreateForm[key].validationError = !item.valid;
                if (!item.valid) {
                  showGeneralError = false;
                  $scope.form.instanceCreateForm[key].validationMessage = item.detail;
                  $scope.errorKeys.push(key);
                }
              });

              if (showGeneralError) {
                $scope.form.instanceCreateForm.generalValidationError = errorMessage;
              }
            } catch (e) {
              console.error($t('views.alerts.unableToParseError', {message: data.message}));
            }
          }
          Alert.error($t('views.alerts.cannotCreateInstance'), errorMessage);
          $scope.form.instanceCreateForm.isSaving = false;
        });
      }
    }
  };

  $scope.cancel = function() {
    $scope.form.instanceCreateForm.$setPristine();
    $location.path('/views');
  };

  $scope.$on('$locationChangeStart', function(event, __targetUrl) {
    if( $scope.form.instanceCreateForm.$dirty ){
      UnsavedDialog().then(function(action) {
        targetUrl = __targetUrl.split('#').pop();
        switch(action){
          case 'save':
            $scope.save();
            break;
          case 'discard':
            $scope.form.instanceCreateForm.$setPristine();
            $location.path(targetUrl);
            break;
          case 'cancel':
            targetUrl = '';
            break;
        }
      });
      event.preventDefault();
    }
  });






}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('ClustersManageAccessCtrl', ['$scope', '$location', 'Cluster', '$routeParams', 'Alert', 'PermissionLoader', 'PermissionSaver', '$translate', 'RoleDetailsModal', '$timeout', function($scope, $location, Cluster, $routeParams, Alert, PermissionLoader, PermissionSaver, $translate, RoleDetailsModal, $timeout) {
  var $t = $translate.instant;
  $scope.getConstant = function (key) {
    return $t('common.' + key).toLowerCase();
  };
  $scope.identity = angular.identity;
  function reloadClusterData(){
    PermissionLoader.getClusterPermissions({
      clusterId: $routeParams.id
    }).then(function(permissions) {
      // Refresh data for rendering
      $scope.permissionsEdit = permissions;
      $scope.permissions = angular.copy(permissions);
      //"$scope.isDataLoaded" should be set to true on initial load after "$scope.permissionsEdit" watcher
      $timeout(function() {
        $scope.isDataLoaded = true;
      });
      var orderedRoles = Cluster.orderedRoles;
      var pms = [];
      for (var key in orderedRoles) {
        pms.push($scope.permissions[orderedRoles[key]]);
      }
      $scope.permissions = pms;
    })
    .catch(function(data) {
      Alert.error($t('clusters.alerts.cannotLoadClusterData'), data.data.message);
    });
  }

  $scope.isDataLoaded = false;
  reloadClusterData();
  $scope.isEditMode = false;
  $scope.permissions = {};
  $scope.clusterName = $routeParams.id;


  $scope.toggleEditMode = function() {
    $scope.isEditMode = !$scope.isEditMode;
  };

  $scope.cancel = function() {
    $scope.isEditMode = false;
    $scope.permissionsEdit = angular.copy($scope.permissions); // Reset textedit areaes
  };

  $scope.save = function() {
    PermissionSaver.saveClusterPermissions(
      $scope.permissionsEdit,
      {
        clusterId: $routeParams.id
      }
    ).then(reloadClusterData)
    .catch(function(data) {
      Alert.error($t('common.alerts.cannotSavePermissions'), data.data.message);
      reloadClusterData();
    });
    $scope.isEditMode = false;
  };

  $scope.$watch(function() {
    return $scope.permissionsEdit;
  }, function(newValue) {
    if (newValue && $scope.isDataLoaded) {
      $scope.save();
    }
  }, true);

  $scope.switchToList = function() {
    $location.url('/clusters/' + $routeParams.id + '/userAccessList');
  };

  $scope.showHelpPage = function() {
    Cluster.getRolesWithAuthorizations().then(function(roles) {
      RoleDetailsModal.show(roles);
    });
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('UserAccessListCtrl',['$scope', '$location', 'Cluster', '$modal', '$rootScope', '$routeParams', 'PermissionSaver', 'Alert', '$translate', 'RoleDetailsModal',
function($scope, $location, Cluster, $modal, $rootScope, $routeParams, PermissionSaver, Alert, $translate, RoleDetailsModal) {
  var $t = $translate.instant;
  $scope.constants = {
    users: $t('common.users').toLowerCase(),
    groups: $t('common.groups').toLowerCase()
  };
  $scope.users = [];
  $scope.usersPerPage = 10;
  $scope.currentPage = 1;
  $scope.totalUsers = 1;
  $scope.currentNameFilter = '';
  $scope.maxVisiblePages = 20;
  $scope.roles = [];
  $scope.clusterId = $routeParams.id;
  $scope.tableInfo = {
    total: 0,
    showed: 0,
    filtered: 0
  };
  $scope.isNotEmptyFilter = true;
  $scope.NONE_ROLE = {
    "permission_label" : $t('common.none'),
    "permission_name" : "CLUSTER.NONE"
  };
  $scope.ALL_ROLE = {
    "permission_label" : $t('common.all'),
    "permission_name" : ""
  };
  $scope.AMBARI_ADMIN_ROLE = {
    "permission_label" : $t('users.roles.ambariAdmin'),
    "permission_name" : "AMBARI.ADMINISTRATOR"
  };

  $scope.pageChanged = function() {
    $scope.loadUsers();
  };
  $scope.usersPerPageChanges = function() {
    $scope.resetPagination();
  };

  $scope.loadUsers = function(){
    Cluster.getPrivilegesWithFilters({
      nameFilter: $scope.currentNameFilter,
      typeFilter: $scope.currentTypeFilter,
      roleFilter: $scope.currentRoleFilter,
      currentPage: $scope.currentPage,
      usersPerPage: $scope.usersPerPage
    }).then(function(data) {
      $scope.totalUsers = data.itemTotal;
      $scope.users = data.items.map(function (user) {
        var privilege = $scope.pickEffectivePrivilege(user.privileges);
        // Redefine principal_name and principal type in case of None
        privilege.principal_name = user.Users? user.Users.user_name : user.Groups.group_name;
        if (privilege.permission_label === "None") {
          privilege.principal_type = user.Users ? 'USER' : 'GROUP';
        }
        var name = encodeURIComponent(privilege.principal_name);
        privilege.encoded_name = name;
        privilege.original_perm = privilege.permission_name;
        privilege.url = user.Users? ('users/' + name) : ('groups/' + name + '/edit');
        privilege.editable = Cluster.ineditableRoles.indexOf(privilege.permission_name) == -1;
        return privilege;
      });
      $scope.tableInfo.total = data.itemTotal;
      $scope.tableInfo.showed = data.items.length;
    });
  };

  $scope.pickEffectivePrivilege = function(privileges) {
    if (privileges && privileges.length > 1) {
      return privileges.reduce(function(prev, cur) {
        var prevIndex = $scope.getRoleRank(prev.PrivilegeInfo.permission_name);
        var curIndex = $scope.getRoleRank(cur.PrivilegeInfo.permission_name)
        return (prevIndex < curIndex) ? prev : cur;
      }).PrivilegeInfo;
    } else if (privileges && privileges.length == 1 && privileges[0].PrivilegeInfo.permission_name !== "VIEW.USER") {
      return privileges[0].PrivilegeInfo;
    } else {
      return angular.copy($scope.NONE_ROLE);
    }
  };

  $scope.loadRoles = function() {
    Cluster.getPermissions().then(function(data) {
      $scope.roles = data.map(function(item) {
        return item.PermissionInfo;
      });
      // [All, Administrator, ...roles..., None]
      $scope.roles.unshift(angular.copy($scope.AMBARI_ADMIN_ROLE));
      $scope.roles.unshift(angular.copy($scope.ALL_ROLE));
      $scope.roles.push(angular.copy($scope.NONE_ROLE));

      // create filter select list
      $scope.roleFilterOptions = angular.copy($scope.roles);
      $scope.roleFilterOptions.pop();  // filter does not support None
      $scope.roleFilterOptions = $scope.roleFilterOptions.map(function(o) {
        return {label: o.permission_label, value: o.permission_name};
      });
      $scope.currentRoleFilter = $scope.roleFilterOptions[0];

      // create value select list
      $scope.roleValueOptions = angular.copy($scope.roles)
      $scope.roleValueOptions.shift(); // value change does not support all/administrator
      $scope.roleValueOptions.shift();
    });
  };

  $scope.getRoleRank = function(permission_name) {
    var orderedRoles = Cluster.orderedRoles.concat(['VIEW.USER','CLUSTER.NONE']);
    var index = orderedRoles.indexOf(permission_name);
    return index;
  };

  $scope.save = function(user) {
    var fromNone = (user.original_perm === $scope.NONE_ROLE.permission_name);
    if (fromNone) {
      $scope.addPrivilege(user);
      return;
    }

    if ($scope.isUserActive) {
      Cluster.getPrivilegesForResource({
          nameFilter : user.user_name,
          typeFilter : $scope.currentTypeFilter
      }).then(function(data) {
        var arrayOfPrivileges = data.items[0].privileges;
        var privilegesOfTypeUser = [];
        var privilegesOfTypeGroup = [];
        for (var i = 0; i < arrayOfPrivileges.length; i++) {
          if(arrayOfPrivileges[i].PrivilegeInfo.permission_name != "VIEW.USER") {
            if(arrayOfPrivileges[i].PrivilegeInfo.principal_type === "GROUP"){
              privilegesOfTypeGroup.push(arrayOfPrivileges[i]);
            } else {
              privilegesOfTypeUser.push(arrayOfPrivileges[i].PrivilegeInfo);
            }
          }
        }

        var effectivePrivilege = $scope.pickEffectivePrivilege(arrayOfPrivileges);
        var effectivePrivilegeFromGroups = $scope.pickEffectivePrivilege(privilegesOfTypeGroup);
        user.principal_type = 'USER';
        user.original_perm = effectivePrivilege.permission_name;
        user.editable = (Cluster.ineditableRoles.indexOf(effectivePrivilege.permission_name) === -1);

        var userIndex = $scope.getRoleRank(user.permission_name);
        var groupIndex = $scope.getRoleRank(effectivePrivilegeFromGroups.permission_name);

        // Process when it's NONE privilege or higher than current effective group privilege
        if (userIndex <= groupIndex || user.permission_name == $scope.NONE_ROLE.permission_name) {
          var privilege_ids = privilegesOfTypeUser.filter(function(privilegeOfTypeUser) {
            return privilegeOfTypeUser.principal_type !== 'ROLE';
          }).map(function (privilegeOfTypeUser) {
            return privilegeOfTypeUser.privilege_id;
          });

          // Purge existing user level privileges if there is any
          if(privilege_ids.length !== 0) {
            Cluster.deleteMultiplePrivileges(
                $routeParams.id,
                privilege_ids
            )
            .then(function() {
              $scope.addPrivilege(user);
            });
          } else {
            $scope.addPrivilege(user);
          }
        } else {
          Alert.error($t('common.alerts.cannotSavePermissions'),
              $t('users.alerts.usersEffectivePrivilege', {user_name : user.user_name})
          );
          $scope.loadUsers();
        }
      });
    } else {
      Cluster.getPrivilegesForResource({
          nameFilter : user.group_name,
          typeFilter : $scope.currentTypeFilter
      }).then(function(data) {
        var arrayOfPrivileges = data.items[0].privileges;
        var privilegesOfTypeGroup = [];
        var privilege = $scope.pickEffectivePrivilege(arrayOfPrivileges);
        user.principal_type = 'GROUP';
        user.original_perm = privilege.permission_name;
        user.editable = (Cluster.ineditableRoles.indexOf(privilege.permission_name) === -1);

        arrayOfPrivileges.forEach(function(privilegeOfTypeGroup) {
          if(privilegeOfTypeGroup.PrivilegeInfo.permission_name != "VIEW.USER") {
            if (privilegeOfTypeGroup.PrivilegeInfo.principal_type === "GROUP") {
              privilegesOfTypeGroup.push(privilegeOfTypeGroup.PrivilegeInfo);
            }
          }
        });

        var privilege_ids = [];
        privilegesOfTypeGroup.forEach(function(privilegeOfTypeGroup) {
          privilege_ids.push(privilegeOfTypeGroup.privilege_id);
        });

        //delete all privileges of type GROUP, if they exist
        //then add the privilege for the group, after which the group displays the effective privilege
        if(privilege_ids.length !== 0) {
          Cluster.deleteMultiplePrivileges(
              $routeParams.id,
              privilege_ids
          )
          .then(function() {
            $scope.addPrivilege(user);
          });
        } else {
          $scope.addPrivilege(user);
        }
      });
    }
  };

  $scope.cancel = function(user) {
    user.permission_name = user.original_perm;
  };

  $scope.addPrivilege = function(user) {
    var changeToNone = user.permission_name == $scope.NONE_ROLE.permission_name;
    if (changeToNone) {
      if ($scope.isUserActive) {
        Alert.success($t('users.alerts.roleChangedToNone', {
            user_name : user.user_name
        }));
      } else {
        $scope.showSuccess(user);
      }
      $scope.loadUsers();
      return;
    }
    Cluster.createPrivileges(
      {
        clusterId: $routeParams.id
      },
      [{PrivilegeInfo: {
        permission_name: user.permission_name,
        principal_name: user.principal_name,
        principal_type: user.principal_type
      }}]
    ).then(function() {
        $scope.showSuccess(user);
        $scope.loadUsers();
      })
      .catch(function(data) {
        Alert.error($t('common.alerts.cannotSavePermissions'), data.data.message);
        $scope.loadUsers();
      });
  };

  $scope.showSuccess = function(user) {
    Alert.success($t('users.alerts.roleChanged', {
      name: user.principal_name,
      role: $scope.roles.filter(function(r){
          return r.permission_name == user.permission_name}
      )[0].permission_label
    }));
  };

  $scope.resetPagination = function() {
    $scope.currentPage = 1;
    $scope.loadUsers();
  };
  $scope.currentRoleFilter = { label:$t('common.all'), value: '' };


  $scope.typeFilterOptions = [
    {label: $t('common.user'), value: 'USER'},
    {label: $t('common.group'), value: 'GROUP'}
  ];

  $scope.isUserActive = true;

  $scope.currentTypeFilter = $scope.typeFilterOptions[0];

  $scope.switchToUser = function() {
    if (!$scope.isUserActive) {
      $scope.currentTypeFilter = $scope.typeFilterOptions[0];
      $scope.isUserActive = true;
      $scope.resetPagination();
    }
  };

  $scope.switchToGroup = function() {
    if ($scope.isUserActive) {
      $scope.currentTypeFilter = $scope.typeFilterOptions[1];
      $scope.isUserActive = false;
      $scope.resetPagination();
    }
  };

  $scope.clearFilters = function() {
    $scope.currentNameFilter = '';
    $scope.isUserActive = true;
    $scope.currentTypeFilter = $scope.typeFilterOptions[0];
    $scope.currentRoleFilter = $scope.roleFilterOptions[0];
    $scope.resetPagination();
  };

  $scope.loadRoles();
  $scope.loadUsers();

  $scope.$watch(
    function (scope) {
      return Boolean(scope.currentNameFilter || (scope.currentTypeFilter && scope.currentTypeFilter.value)
        || (scope.currentRoleFilter && scope.currentRoleFilter.value));
    },
    function (newValue, oldValue, scope) {
      scope.isNotEmptyFilter = newValue;
    }
  );

  $rootScope.$watch(function(scope) {
    return scope.LDAPSynced;
  }, function(LDAPSynced) {
    if(LDAPSynced === true){
      $rootScope.LDAPSynced = false;
      $scope.loadUsers();
    }
  });

  $scope.switchToBlock = function() {
    $location.url('/clusters/' + $routeParams.id + '/manageAccess');
  };

  $scope.showHelpPage = function() {
    Cluster.getRolesWithAuthorizations().then(function(roles) {
      RoleDetailsModal.show(roles);
    });
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('StackVersionsCreateCtrl', ['$scope', 'Stack', 'Utility', '$routeParams', '$location', '$timeout' ,'Alert', '$translate', 'Cluster', 'AddRepositoryModal', 'AddVersionModal', 'ConfirmationModal',
    function($scope, Stack, Utility, $routeParams, $location, $timeout, Alert, $translate, Cluster, AddRepositoryModal, AddVersionModal, ConfirmationModal) {
  var $t = $translate.instant;
  $scope.constants = {
    os: $t('versions.os')
  };
  $scope.createController = true;
  $scope.osList = [];
  $scope.stackIds = [];
  $scope.allVersions = [];
  $scope.networkLost = false;
  $scope.skipValidation = false;
  $scope.useRedhatSatellite = false;

  $scope.clusterName = $routeParams.clusterName;
  $scope.subversionPattern = /^\d+\.\d+(-\d+)?$/;
  $scope.upgradeStack = {
    stack_name: '',
    stack_version: '',
    display_name: ''
  };

  $scope.isGPLAccepted = false;

  $scope.isGPLRepo = function (repository) {
    return repository.Repositories.tags.indexOf('GPL') >= 0;
  };

  $scope.showRepo = function (repository) {
    return $scope.isGPLAccepted || !$scope.isGPLRepo(repository);
  };

  $scope.publicOption = {
    index: 1,
    hasError: false
  };
  $scope.localOption = {
    index: 2,
    hasError: false
  };
  $scope.option1 = {
    index: 3,
    displayName: $t('versions.uploadFile'),
    file: '',
    hasError: false
  };
  $scope.option2 = {
    index: 4,
    displayName: $t('versions.enterURL'),
    url: $t('versions.defaultURL'),
    hasError: false
  };
  $scope.selectedOption = {
    index: 1
  };
  $scope.selectedLocalOption = {
    index: 3
  };

  /**
   * User can select ONLY one option to upload version definition file
   */
  $scope.toggleOptionSelect = function () {
    $scope.option1.hasError = false;
    $scope.option2.hasError = false;
  };
  $scope.isPublicRepoSelected = function () {
    if ($scope.selectedOption.index == $scope.publicOption.index) return true;
  };
  $scope.togglePublicLocalOptionSelect = function () {
    if ($scope.selectedOption.index == $scope.publicOption.index) {
      $scope.setInitialPublicRepoVersions();
    } else {
      $scope.clearRepoVersions();
    }
    $scope.validateRepoUrl();
  };
  $scope.setInitialPublicRepoVersions = function () {
    angular.forEach($scope.osList, function (os) {
      os.repositories.forEach(function(repo) {
        repo.Repositories.base_url = repo.Repositories.initial_base_url;
      });
    });
  };
  $scope.clearRepoVersions = function () {
    angular.forEach($scope.osList, function (os) {
      os.repositories.forEach(function(repo) {
        repo.Repositories.base_url = '';
      });
    });
  };
  $scope.clearOptionsError = function () {
    $scope.option1.hasError = false;
    $scope.option2.hasError = false;
  };
  $scope.readInfoButtonDisabled = function () {
    if ($scope.selectedOption.index == $scope.publicOption.index) return true;
    return $scope.option1.index == $scope.selectedLocalOption.index ? !$scope.option1.file : !$scope.option2.url;
  };
  $scope.isAddOsButtonDisabled = function () {
    var selectedCnt = 0;
    angular.forEach($scope.osList, function (os) {
      if (os.selected) {
        selectedCnt ++;
      }
    });
    return $scope.osList.length == selectedCnt || $scope.useRedhatSatellite;
  };

  $scope.allInfoCategoriesBlank = function () {
    return !$scope.upgradeStack.stack_name;
  };

  $scope.onFileSelect = function(e){
    if (e.files && e.files.length == 1) {
      var file = e.files[0];
      var reader = new FileReader();
      reader.onload = (function () {
        return function (e) {
          $scope.option1.file = e.target.result;
        };
      })(file);
      reader.readAsText(file);
    } else {
      $scope.option1.file = '';
    }
  };

  /**
   * On click handler for adding a new version
   */
  $scope.addVersion = function() {
    AddVersionModal.show($scope);
  };

  /**
   * Load selected file to current page content
   */
  $scope.readVersionInfo = function(){
    var data = {};
    var isXMLdata = false;
    if ($scope.option2.index == $scope.selectedLocalOption.index) {
      var url = $scope.option2.url;
      data = {
        "VersionDefinition": {
          "version_url": url
        }
      };
    } else if ($scope.option1.index == $scope.selectedLocalOption.index) {
      isXMLdata = true;
      // load from file browser
      data = $scope.option1.file;
    }

    return Stack.postVersionDefinitionFile(isXMLdata, data).then(function (versionInfo) {
      if (versionInfo.id && versionInfo.stackName && versionInfo.stackVersion) {
        Stack.getRepo(versionInfo.id, versionInfo.stackName, versionInfo.stackVersion)
          .then(function (response) {
            $scope.setVersionSelected(response);
        });
      }
    })
    .catch(function (data) {
      Alert.error($t('versions.alerts.readVersionInfoError'), data.message);
    });
  };

  /**
   * Load GPL License Accepted value
   */
  $scope.fetchGPLLicenseAccepted = function () {
    Stack.getGPLLicenseAccepted().then(function (data) {
      $scope.isGPLAccepted = data === 'true';
    })
  };

  /**
   * Load supported OS list
   */
  $scope.afterStackVersionRead = function () {
    Stack.getSupportedOSList($scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version)
      .then(function (data) {
        var existingOSHash = {};
        angular.forEach($scope.osList, function (os) {
          if (angular.isUndefined(os.selected)) {
            os.selected = true;
          }
          existingOSHash[os.OperatingSystems.os_type] = os;

        });
        var operatingSystems = data.operating_systems;
        angular.forEach(operatingSystems, function (stackOs) {
          // if os not in the list, mark as un-selected, add this to the osList
          if (!existingOSHash[stackOs.OperatingSystems.os_type]) {
            stackOs.selected = false;
            stackOs.repositories.forEach(function(repo) {
              repo.Repositories.initial_base_url = repo.Repositories.default_base_url;
            });
            $scope.osList.push(stackOs);
          }
        });
        if ($scope.selectedOption.index == $scope.localOption.index) {
          $scope.clearRepoVersions();
          $scope.validateRepoUrl();
        }
      })
      .catch(function (data) {
        Alert.error($t('versions.alerts.osListError'), data.message);
      });
  };

  /**
   * On click handler for removing OS
   */
  $scope.removeOS = function() {
    if ($scope.useRedhatSatellite) {
      return;
    }
    this.os.selected = false;
    if (this.os.repositories) {
      this.os.repositories.forEach(function(repo) {
        repo.hasError = false;
      });
    }
  };
  /**
   * On click handler for adding new OS
   */
  $scope.addOS = function($event) {
    var dropdownEl = $event.target.parentElement.parentElement;
    // close the dopdown when an OS is added.
    $timeout(function () {
      dropdownEl.click();
    });

    this.os.selected = true;
    if (this.os.repositories) {
      this.os.repositories.forEach(function(repo) {
        repo.hasError = false;
      });
    }
  };

  /**
   * On click handler for adding a new repository
   */
  $scope.addRepository = function() {
    AddRepositoryModal.show($scope.osList, $scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version, $scope.id);
  };

  $scope.validBaseUrlsExist = function () {
    var validBaseUrlsExist = true;
    if ($scope.osList) {
      $scope.osList.forEach(function(os) {
        if (os.repositories && os.selected) {
          os.repositories.forEach(function(repo) {
            if (repo.invalidBaseUrl) {
              validBaseUrlsExist = false;
            }
          })
        }
      });
    }
    return validBaseUrlsExist;
  };


  $scope.isSaveButtonDisabled = function() {
    var enabled = false;
    $scope.osList.forEach(function(os) {
      if (os.selected) {
        enabled = true
      }
    });
    return !(enabled && $scope.validBaseUrlsExist());
  };

  $scope.defaulfOSRepos = {};

  $scope.save = function () {
    $scope.editVersionDisabled = true;
    delete $scope.updateObj.href;
    $scope.updateObj.operating_systems = [];
    angular.forEach($scope.osList, function (os) {
      os.OperatingSystems.ambari_managed_repositories = !$scope.useRedhatSatellite;
      if (os.selected) {
        $scope.updateObj.operating_systems.push(os);
      }
    });

    var skip = $scope.skipValidation || $scope.useRedhatSatellite;
    return Stack.validateBaseUrls(skip, $scope.osList, $scope.upgradeStack).then(function (invalidUrls) {
      if (invalidUrls.length === 0) {
        if ($scope.isPublicVersion) {
          var data = {
            "VersionDefinition": {
              "available": $scope.id
            }
          };
          var isXMLdata = false;
        } else {
          var data = $scope.data;
          var isXMLdata = $scope.isXMLdata;
        }

        if (!isXMLdata) {
          data.VersionDefinition.display_name = $scope.activeStackVersion.displayName;
        }

        var repoUpdate = {
          operating_systems: $scope.updateObj.operating_systems
        };
        Stack.postVersionDefinitionFile(isXMLdata, data, false).then(function (response) {
          var versionInfo = response.resources[0].VersionDefinition;
          if (versionInfo.id && versionInfo.stack_name && versionInfo.stack_version) {
            Stack.updateRepo(versionInfo.stack_name, versionInfo.stack_version, versionInfo.id, repoUpdate).then(function () {
              Alert.success($t('versions.alerts.versionCreated', {
                stackName: $scope.upgradeStack.stack_name,
                versionName: $scope.actualVersion
              }));
              $location.path('/stackVersions');
            }).catch(function (data) {
              Stack.deleteRepo(versionInfo.stack_name, versionInfo.stack_version, versionInfo.id);
              ConfirmationModal.show(
                $t('versions.register.error.header'),
                $t('versions.register.error.body'),
                null,
                null,
                true
              )
            });
          }
        })
        .catch(function (data) {
          Alert.error($t('versions.alerts.readVersionInfoError'), data.message);
        });
      } else {
        Stack.highlightInvalidUrls(invalidUrls);
      }
    });
  };

  $scope.updateRepoVersions = function () {
    var skip = $scope.skipValidation || $scope.useRedhatSatellite;
    // Filter out repositories that are not shown in the UI
    var osList = Object.assign([], $scope.osList).map(function(os) {
      return Object.assign({}, os, {repositories: os.repositories.filter(function(repo) { return $scope.showRepo(repo); })});
    });
    return Stack.validateBaseUrls(skip, osList, $scope.upgradeStack).then(function (invalidUrls) {
      if (invalidUrls.length === 0) {
        Stack.updateRepo($scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version, $scope.id, $scope.updateObj).then(function () {
          Alert.success($t('versions.alerts.versionEdited', {
            stackName: $scope.upgradeStack.stack_name,
            versionName: $scope.actualVersion,
            displayName: $scope.repoVersionFullName
          }));
          $location.path('/stackVersions');
        }).catch(function (data) {
          Alert.error($t('versions.alerts.versionUpdateError'), data.message);
        });
      } else {
        Stack.highlightInvalidUrls(invalidUrls);
      }
    });
  };

  $scope.cancel = function () {
    $scope.editVersionDisabled = true;
    $location.path('/stackVersions');
  };

  $scope.clearErrors = function() {
    if ($scope.osList) {
      $scope.osList.forEach(function(os) {
        if (os.repositories) {
          os.repositories.forEach(function(repo) {
            repo.hasError = false;
          })
        }
      });
    }
    if ($scope.useRedhatSatellite) {
      ConfirmationModal.show(
          $t('common.important'),
          {
            "url": 'views/modals/BodyForUseRedhatSatellite.html'
          }
      ).catch(function () {
        $scope.useRedhatSatellite = !$scope.useRedhatSatellite;
      });
    }
  };

  $scope.showPublicRepoDisabledDialog = function() {
    ConfirmationModal.show(
      $t('versions.networkIssues.publicDisabledHeader'),
      {
        "url": 'views/modals/publicRepoDisabled.html'
      },
      $t('common.controls.ok'),
      $t('common.controls.cancel'),
      true
    )
  };

  $scope.onRepoUrlChange = function (repository) {
    $scope.clearError(repository);
    $scope.setInvalidUrlError(repository);
  };

  $scope.undoChange = function(repo) {
    if ($scope.selectedOption.index == 1) {
      repo.Repositories.base_url = repo.Repositories.initial_base_url;
    } else {
      repo.Repositories.base_url = '';
    }
  };

  $scope.clearError = function(repository) {
    repository.hasError = false;
  };

  $scope.setInvalidUrlError = function (repository) {
    repository.invalidBaseUrl =  !$scope.isValidRepoBaseUrl(repository.Repositories.base_url);
  };
  /**
   * Validate base URL
   * @param {string} value
   * @returns {boolean}
   */
  $scope.isValidRepoBaseUrl = function (value) {
    var remotePattern = /^(?:(?:https?|ftp):\/{2})(?:\S+(?::\S*)?@)?(?:(?:(?:[\w\-.]))*)(?::[0-9]+)?(?:\/\S*)?$/,
      localPattern = /^file:\/{2,3}([a-zA-Z][:|]\/){0,1}[\w~!*'();@&=\/\\\-+$,?%#.\[\]]+$/;
    return remotePattern.test(value) || localPattern.test(value);
  };

  $scope.hasValidationErrors = function() {
    var hasErrors = false;
    if ($scope.osList) {
      $scope.osList.forEach(function(os) {
        if (os.repositories) {
          os.repositories.forEach(function(repo) {
            if (repo.hasError) {
              hasErrors = true;
            }
          })
        }
      });
    }
    return hasErrors;
  };


  $scope.setVersionSelected = function (version) {
    var response = version;
    var stackVersion = response.updateObj.RepositoryVersions || response.updateObj.VersionDefinition;
    $scope.id = response.id;
    $scope.isPatch = stackVersion.type === 'PATCH';
    $scope.isMaint = stackVersion.type === 'MAINT';
    $scope.stackNameVersion = response.stackNameVersion || $t('common.NA');
    $scope.displayName = response.displayName || $t('common.NA');
    $scope.actualVersion = response.repositoryVersion || response.actualVersion || $t('common.NA');
    $scope.isPublicVersion = response.showAvailable == true;
    $scope.updateObj = response.updateObj;
    $scope.upgradeStack = {
      stack_name: response.stackName,
      stack_version: response.stackVersion,
      display_name: response.displayName || $t('common.NA')
    };
    $scope.activeStackVersion.services = Stack.filterAvailableServices(response);
    $scope.repoVersionFullName = response.repoVersionFullName;
    $scope.osList = response.osList;

    // load supported os type base on stack version
    $scope.afterStackVersionRead();

    // Load GPL license accepted value
    $scope.fetchGPLLicenseAccepted();
  };

  $scope.selectRepoInList = function() {
    $scope.selectedPublicRepoVersion = this.version;
    $scope.setVersionSelected(this.version);
  };

  $scope.onStackIdChange = function () {
    $scope.setStackIdActive(this.stack);
    $scope.setVisibleStackVersions($scope.allVersions);
    $scope.setVersionSelected($scope.activeStackVersion);
  };

  $scope.setStackIdActive =  function (stack) {
    angular.forEach($scope.stackIds, function(_stack){
      _stack.isSelected = false;
    });
    stack.isSelected = true;
  };

  $scope.setStackIds = function(stacks) {
    var stackIds = [];
    // sort stacks as per per {stack_name}-{stack_version}
    stacks.sort(function(a,b){
      if (a.stackName === b.stackName) {
        var aStackVersion = parseFloat(a.stackVersion);
        var bStackVersion = parseFloat(b.stackVersion);
        if (aStackVersion === bStackVersion) {
          // sort numerically as per per {repository_version}
          return Utility.compareVersions(a.repositoryVersion, b.repositoryVersion);
        } else {
          //sort numerically as per per {stack_version}
          return aStackVersion > bStackVersion;
        }
      } else {
        //sort lexicographically as per per {stack_name}
        return  (a.stackName > b.stackName);
      }
    }).reverse();
    angular.forEach(stacks, function (stack) {
      stackIds.push(stack.stackNameVersion);
    });
    $scope.stackIds = stackIds.filter(function(item, index, self){
      return self.indexOf(item) === index;
    }).map(function(item){
      return {
        stackNameVersion: item,
        isSelected: false
      };
    });
    $scope.stackIds[0].isSelected = true;
  };

  $scope.setActiveVersion = function () {
    $scope.activeStackVersion = this.version;
    $scope.setVersionSelected($scope.activeStackVersion);
  };

  $scope.setVisibleStackVersions = function (versions) {
    var activeStackId = $scope.stackIds.find(function(item){
      return item.isSelected === true;
    });
    angular.forEach(versions, function (item, index) {
      item.visible = (item.stackNameVersion === activeStackId.stackNameVersion);
    });
    $scope.activeStackVersion = versions.filter(function(item){
      return item.visible;
    })[0];
  };

  $scope.setNetworkIssues = function (versions) {
   $scope.networkLost = !versions.find(function(_version){
     return !_version.stackDefault;
   });
    if ($scope.networkLost) {
      $scope.selectedOption.index = 2;
      $scope.clearRepoVersions();
    }
  };

  $scope.validateRepoUrl = function () {
    angular.forEach($scope.osList,function(os){
      if (os.repositories) {
        os.repositories.forEach(function(repo) {
          $scope.onRepoUrlChange(repo);
        });
      }
    });
  };

  $scope.updateCurrentVersionInput = function () {
    $scope.activeStackVersion.displayName = $scope.activeStackVersion.stackNameVersion + "." + angular.element('[name="version"]')[0].value;
  };

  $scope.fetchPublicVersions = function () {
    return Stack.allPublicStackVersions().then(function (versions) {
      if (versions && versions.length) {
        $scope.setStackIds(versions);
        $scope.setVisibleStackVersions(versions);
        $scope.allVersions = versions;
        $scope.selectedPublicRepoVersion = $scope.activeStackVersion;
        $scope.setVersionSelected($scope.activeStackVersion);
        $scope.setNetworkIssues(versions);
        $scope.validateRepoUrl();
        $scope.availableStackRepoList = versions.length == 1 ? [] : versions;
      }
    });
  };

  $scope.fetchPublicVersions();
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .controller('StackVersionsListCtrl', ['$scope', 'Cluster', 'Stack', '$routeParams', '$translate', 'Settings', function ($scope, Cluster, Stack, $routeParams, $translate, Settings) {
    var $t = $translate.instant;
    $scope.getConstant = function (key) {
      return $t('common.' + key).toLowerCase();
    };
    $scope.clusterName = $routeParams.clusterName;
    $scope.filter = {
      name: '',
      version: '',
      type: '',
      cluster: {
        options: [],
        current: null
      },
      stack: {
        options: [],
        current: null
      }
    };
    $scope.isNotEmptyFilter = true;

    $scope.pagination = {
      totalRepos: 10,
      maxVisiblePages: 20,
      itemsPerPage: 10,
      currentPage: 1
    };

    $scope.tableInfo = {
      total: 0,
      showed: 0,
      filtered: 0
    };

    $scope.repos = [];
    $scope.dropDownClusters = [];
    $scope.selectedCluster = $scope.dropDownClusters[0];

    $scope.resetPagination = function () {
      $scope.pagination.currentPage = 1;
      $scope.loadAllData();
    };

    $scope.pageChanged = function () {
      $scope.loadAllData();
    };

    $scope.goToCluster = function() {
      window.location.replace(Settings.siteRoot + '#/main/admin/stack/versions');
    };

    $scope.clearFilters = function () {
      $scope.filter.name = '';
      $scope.filter.version = '';
      $scope.filter.cluster.current = $scope.filter.cluster.options[0];
      $scope.filter.stack.current = $scope.filter.stack.options[0];
      $scope.resetPagination();
    };

    $scope.fetchRepoClusterStatus = function () {
      var clusterName = ($scope.clusters && $scope.clusters.length > 0) ? $scope.clusters[0].Clusters.cluster_name : null; // only support one cluster at the moment
      if (clusterName) {
        angular.forEach($scope.repos, function (repo) {
          Cluster.getRepoVersionStatus(clusterName, repo.id).then(function (response) {
            repo.status = response.status;
            repo.totalHosts = response.totalHosts;
            repo.currentHosts = response.currentHosts;
            repo.installedHosts = response.installedHosts;
            repo.stackVersionId = response.stackVersionId;
            repo.cluster = (repo.status == 'current' || repo.status == 'installed') ? clusterName : '';
          });
        });
      }
    };

    $scope.fetchRepos = function () {
      return Stack.allRepos($scope.filter, $scope.pagination).then(function (repos) {
        $scope.pagination.totalRepos = repos.itemTotal;
        $scope.repos = repos.items;
        $scope.tableInfo.total = repos.itemTotal;
        $scope.tableInfo.showed = repos.showed;
      });
    };

    $scope.fillClusters = function (clusters) {
      $scope.dropDownClusters = [].concat(clusters);
      var options = [{label: $t('common.all'), value: ''}];
      angular.forEach(clusters, function (cluster) {
        options.push({
          label: cluster.Clusters.cluster_name,
          value: cluster.Clusters.cluster_name
        });
      });
      $scope.filter.cluster.options = options;
      if (!$scope.filter.cluster.current) {
        $scope.filter.cluster.current = options[0];
      }
    };

    $scope.fetchClusters = function () {
      return Cluster.getAllClusters().then(function (clusters) {
        if (clusters && clusters.length > 0) {
          $scope.clusters = clusters;
          $scope.fillClusters(clusters);
        }
      });
    };

    $scope.fetchStacks = function () {
      return Stack.allStackVersions().then(function (clusters) {
        if (clusters && clusters.length > 0) {
          $scope.stacks = clusters;
          $scope.fillStacks(clusters);
        }
      });
    };

    $scope.fillStacks = function() {
      var options = [{label: $t('common.all'), value: ''}];
      angular.forEach($scope.stacks, function (stack) {
        if (stack.active) {
          options.push({
            label: stack.displayName,
            value: stack.displayName
          });
        }
      });
      $scope.filter.stack.options = options;
      if (!$scope.filter.stack.current) {
        $scope.filter.stack.current = options[0];
      }
    };

    $scope.loadAllData = function () {
      $scope.fetchStacks()
        .then(function () {
          return $scope.fetchClusters();
        })
        .then(function () {
          return $scope.fetchRepos();
        })
        .then(function () {
          $scope.fetchRepoClusterStatus();
        });
    };

    $scope.loadAllData();

    $scope.$watch('filter', function (filter) {
      $scope.isNotEmptyFilter = Boolean(filter.name
        || filter.version
        || filter.type
        || (filter.cluster.current && filter.cluster.current.value)
        || (filter.stack.current && filter.stack.current.value));
    }, true);

    $scope.toggleVisibility = function (repo) {
      repo.isProccessing = true;
      var payload = {
        RepositoryVersions:{
          hidden: repo.hidden
        }
      }
      Stack.updateRepo(repo.stack_name, repo.stack_version, repo.id, payload).then( null, function () {
        repo.hidden = !repo.hidden;
      }).finally( function () {
        delete repo.isProccessing;
      });
    }

    $scope.isHideCheckBoxEnabled = function ( repo ) {
      return !repo.isProccessing && ( !repo.cluster || repo.isPatch && ( repo.status === 'installed' || repo.status === 'install_failed') );
    }
  }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('StackVersionsEditCtrl', ['$scope', '$location', 'Cluster', 'Stack', '$routeParams', 'ConfirmationModal', 'Alert', '$translate', 'AddRepositoryModal', function($scope, $location, Cluster, Stack, $routeParams, ConfirmationModal, Alert, $translate, AddRepositoryModal) {
  var $t = $translate.instant;
  $scope.constants = {
    os: $t('versions.os')
  };
  $scope.editController = true;
  $scope.osList = []; // view modal for display repo urls of various OSes
  $scope.skipValidation = false;
  $scope.useRedhatSatellite = false;
  $scope.upgradeStack = {
    stack_name: '',
    stack_version: '',
    display_name: ''
  };
  $scope.defaulfOSRepos = {}; // a copy of initial loaded repo info for "changed" check later
  $scope.isGPLAccepted = false;
  
  $scope.isGPLRepo = function (repository) {
    return repository.Repositories.tags.indexOf('GPL') >= 0;
  };

  $scope.showRepo = function (repository) {
    return $scope.isGPLAccepted || !$scope.isGPLRepo(repository);
  };

  $scope.loadStackVersionInfo = function () {
    return Stack.getRepo($routeParams.versionId, $routeParams.stackName).then(function (response) {
      var stackVersion = response.updateObj.RepositoryVersions || response.updateObj.VersionDefinition;
      $scope.activeStackVersion = response;
      $scope.id = response.id;
      $scope.isPatch = stackVersion.type === 'PATCH';
      $scope.isMaint = stackVersion.type === 'MAINT';
      $scope.stackNameVersion = response.stackNameVersion || $t('common.NA');
      $scope.displayName = response.displayName || $t('common.NA');
      $scope.version = response.version || $t('common.NA');
      $scope.actualVersion = response.actualVersion || $t('common.NA');
      $scope.useRedhatSatellite = !response.ambari_managed_repositories;
      $scope.updateObj = response.updateObj;
      $scope.upgradeStack = {
        stack_name: response.stackName,
        stack_version: response.stackVersion,
        display_name: response.displayName
      };
      $scope.activeStackVersion.services = Stack.filterAvailableServices(response);
      response.updateObj.operating_systems.forEach(function(os) {
        $scope.defaulfOSRepos[os.OperatingSystems.os_type] = {};
        os.repositories.forEach(function(repo) {
          $scope.defaulfOSRepos[os.OperatingSystems.os_type][repo.Repositories.repo_id] = repo.Repositories.base_url;
        });
      });
      $scope.repoVersionFullName = response.repoVersionFullName;
      angular.forEach(response.osList, function (os) {
        os.selected = true;
      });
      $scope.osList = response.osList;
      // load supported os type base on stack version
      $scope.afterStackVersionRead();

      // Load GPL license accepted value
      $scope.fetchGPLLicenseAccepted();

      // if user reach here from UI click, repo status should be cached
      // otherwise re-fetch repo status from cluster end point.
      $scope.repoStatus = Cluster.repoStatusCache[$scope.id];
      if (!$scope.repoStatus) {
        $scope.fetchClusters()
        .then(function () {
          return $scope.fetchRepoClusterStatus();
        })
        .then(function () {
          $scope.deleteEnabled = $scope.isDeletable();
        });
      } else {
        $scope.deleteEnabled = $scope.isDeletable();
      }
    });
  };

  /**
   * Load GPL License Accepted value
   */
  $scope.fetchGPLLicenseAccepted = function () {
    Stack.getGPLLicenseAccepted().then(function (data) {
      $scope.isGPLAccepted = data === 'true';
    })
  };

  /**
   * Load supported OS list
   */
  $scope.afterStackVersionRead = function () {
    Stack.getSupportedOSList($scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version)
      .then(function (data) {
        var operatingSystems = data.operating_systems;
        operatingSystems.map(function (os) {
          var existingOSHash = {};
          angular.forEach($scope.osList, function (os) {
            os.repositories.forEach(function(repo) {
              repo.Repositories.initial_base_url = repo.Repositories.base_url;
            });
            existingOSHash[os.OperatingSystems.os_type] = os;
          });
          // if os not in the list, mark as un-selected, add this to the osList
          if (!existingOSHash[os.OperatingSystems.os_type]) {
            os.selected = false;
            os.repositories.forEach(function(repo) {
              repo.Repositories.base_url = '';
            });
            $scope.osList.push(os);
          }
        });
      })
      .catch(function (data) {
        Alert.error($t('versions.alerts.osListError'), data.message);
      });
  };

  $scope.isDeletable = function() {
    return !($scope.repoStatus == 'current' || $scope.repoStatus == 'installed');
  };

  $scope.disableUnusedOS = function() {
    Cluster.getClusterOS().then(function(usedOS){
      angular.forEach($scope.osList, function (os) {
        if (os.OperatingSystems.os_type !== usedOS) {
          os.disabled = true;
        }
      });
    });
  };

  $scope.save = function () {
    $scope.editVersionDisabled = true;
    delete $scope.updateObj.href;
    $scope.updateObj.operating_systems = [];
    // check if there is any change in repo list
    var changed = false;
    angular.forEach($scope.osList, function (os) {
      var savedUrls = $scope.defaulfOSRepos[os.OperatingSystems.os_type];
      if (os.selected) { // currently shown?
        if (savedUrls) { // initially loaded?
          angular.forEach(os.repositories, function (repo) {
            if (repo.Repositories.base_url != savedUrls[repo.Repositories.repo_id]) {
              changed = true; // modified
            }
          });
        } else {
          changed = true; // added
        }
        os.OperatingSystems.ambari_managed_repositories = !$scope.useRedhatSatellite;
        $scope.updateObj.operating_systems.push(os);
      } else {
        if (savedUrls) {
          changed = true; // removed
        }
      }
    });
    // show confirmation when making changes to current/installed repo
    if (changed && !$scope.deleteEnabled) {
      ConfirmationModal.show(
          $t('versions.changeBaseURLConfirmation.title'),
          $t('versions.changeBaseURLConfirmation.message'),
          $t('common.controls.confirmChange')
      ).then(function() {
        $scope.updateRepoVersions();
      });
    } else {
      $scope.updateRepoVersions();
    }
  };

  $scope.updateRepoVersions = function () {
    var skip = $scope.skipValidation || $scope.useRedhatSatellite;
    // Filter out repositories that are not shown in the UI
    var osList = Object.assign([], $scope.osList).map(function(os) {
      return Object.assign({}, os, {repositories: os.repositories.filter(function(repo) { return $scope.showRepo(repo); })});
    });
    return Stack.validateBaseUrls(skip, osList, $scope.upgradeStack).then(function (invalidUrls) {
      if (invalidUrls.length === 0) {
        Stack.updateRepo($scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version, $scope.id, $scope.updateObj).then(function () {
          Alert.success($t('versions.alerts.versionEdited', {
            stackName: $scope.upgradeStack.stack_name,
            versionName: $scope.actualVersion,
            displayName: $scope.repoVersionFullName
          }));
          $location.path('/stackVersions');
        }).catch(function (data) {
          Alert.error($t('versions.alerts.versionUpdateError'), data.message);
        });
      } else {
        Stack.highlightInvalidUrls(invalidUrls);
      }
    });
  };

  $scope.fetchRepoClusterStatus = function () {
    var clusterName = ($scope.clusters && $scope.clusters.length > 0)
      ? $scope.clusters[0].Clusters.cluster_name : null; // only support one cluster at the moment
    if (!clusterName) {
      return null;
    }
    return Cluster.getRepoVersionStatus(clusterName, $scope.id).then(function (response) {
      $scope.repoStatus = response.status;
    });
  };

  $scope.fetchClusters = function () {
    return Cluster.getAllClusters().then(function (clusters) {
      $scope.clusters = clusters;
    });
  };

  $scope.delete = function () {
    ConfirmationModal.show(
      $t('versions.deregister'),
      {
        "url": 'views/modals/BodyForDeregisterVersion.html',
        "scope": {"displayName": $scope.repoVersionFullName }
      }
    ).then(function() {
        Stack.deleteRepo($scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version, $scope.id).then( function () {
          $location.path('/stackVersions');
        }).catch(function (data) {
            Alert.error($t('versions.alerts.versionDeleteError'), data.message);
          });
      });
  };

  /**
   * On click handler for removing OS
   */
  $scope.removeOS = function() {
    if ($scope.useRedhatSatellite) {
      return;
    }
    this.os.selected = false;
    if (this.os.repositories) {
      this.os.repositories.forEach(function(repo) {
        repo.hasError = false;
      });
    }
  };
  /**
   * On click handler for adding new OS
   */
  $scope.addOS = function() {
    this.os.selected = true;
    if (this.os.repositories) {
      this.os.repositories.forEach(function(repo) {
        repo.hasError = false;
      });
    }
  };

  $scope.isAddOsButtonDisabled = function () {
    var selectedCnt = 0;
    angular.forEach($scope.osList, function (os) {
      if (os.selected) {
        selectedCnt ++;
      }
    });
    return $scope.osList.length == selectedCnt || $scope.useRedhatSatellite;
  };

  $scope.hasNotDeletedRepo = function () {
    //check if any repository has been selected for deleting
    //if yes, drop down should be displayed
    var repoNotDeleted = true;
    for(var i=0;i<$scope.osList.length;i++) {
      if (!$scope.osList[i].selected) {
        repoNotDeleted=false;
        break; 
      }
    }
    return repoNotDeleted;
  };

  /**
   * On click handler for adding a new repository
   */
  $scope.addRepository = function() {
    AddRepositoryModal.show($scope.osList, $scope.upgradeStack.stack_name, $scope.upgradeStack.stack_version, $scope.id);
  };

  $scope.isSaveButtonDisabled = function() {
    var enabled = false;
    $scope.osList.forEach(function(os) {
      if (os.selected) {
        enabled = true
      }
    });
    return !enabled;
  };

  $scope.cancel = function () {
    $scope.editVersionDisabled = true;
    $location.path('/stackVersions');
  };

  $scope.undoChange = function(repo) {
    repo.Repositories.base_url = repo.Repositories.initial_base_url;
  };

  $scope.clearErrors = function() {
    if ($scope.osList) {
      $scope.osList.forEach(function(os) {
        if (os.repositories) {
          os.repositories.forEach(function(repo) {
            repo.hasError = false;
          })
        }
      });
    }
    if ($scope.useRedhatSatellite) {
      ConfirmationModal.show(
          $t('common.important'),
          {
            "url": 'views/modals/BodyForUseRedhatSatellite.html'
          }
      ).catch(function () {
        $scope.useRedhatSatellite = !$scope.useRedhatSatellite;
      });
    }
  };

  $scope.clearError = function () {
    this.repository.hasError = false;
  };

  $scope.hasValidationErrors = function () {
    var hasErrors = false;
    if ($scope.osList) {
      $scope.osList.forEach(function (os) {
        if (os.repositories) {
          os.repositories.forEach(function (repo) {
            if (repo.hasError) {
              hasErrors = true;
            }
          })
        }
      });
    }
    return hasErrors;
  };

  $scope.loadStackVersionInfo();
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('RemoteClustersCreateCtrl', ['$scope', '$routeParams', '$location', 'Alert', '$translate', 'Cluster', 'AddRepositoryModal' , 'Settings', 'RemoteCluster', function($scope, $routeParams, $location, Alert, $translate, Cluster, AddRepositoryModal, Settings, RemoteCluster) {
  var $t = $translate.instant;

  $scope.cluster = {};

  $scope.nameValidationPattern = /^\s*\w*\s*$/;

  $scope.registerRemoteCluster = function () {
    $scope.form.submitted = true;
    if ($scope.form.$valid){
     var payload = {
        "ClusterInfo" :{
          "name" : $scope.cluster.cluster_name,
          "url" : $scope.cluster.cluster_url,
          "username" : $scope.cluster.cluster_user,
          "password" : $scope.cluster.cluster_password
        }
      };

      var config = {
        headers : {
          'X-Requested-By': 'Ambari;'
        }
      }

      RemoteCluster.register(payload, config).then(function(data) {
          Alert.success($t('common.alerts.remoteClusterRegistered', {clusterName: payload.ClusterInfo.name}));
          $scope.form.$setPristine();
          $location.path('/remoteClusters/'+ $scope.cluster.cluster_name +'/edit')
        })
        .catch(function(data) {
          console.log(data);
          Alert.error(data.message);
       });

    }
  };

  $scope.cancel = function () {
    $scope.editVersionDisabled = true;
    $location.path('/remoteClusters');
  };


}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('RemoteClustersListCtrl', ['$scope', '$routeParams', '$translate', 'RemoteCluster', function ($scope, $routeParams, $translate, RemoteCluster) {
  var $t = $translate.instant;

  $scope.clusterName = $routeParams.clusterName;

  $scope.constants = {
    groups: $t('common.clusters').toLowerCase()
  };

  $scope.groupsPerPage = 10;
  $scope.currentPage = 1;
  $scope.totalGroups = 1;
  $scope.currentNameFilter = '';
  $scope.maxVisiblePages=20;
  $scope.tableInfo = {
    total: 0,
    showed: 0
  };

  $scope.isNotEmptyFilter = true;

  $scope.pageChanged = function() {
    loadRemoteClusters();
  };
  $scope.groupsPerPageChanges = function() {
    loadRemoteClusters();
  };

  $scope.resetPagination = function() {
    $scope.currentPage = 1;
    loadRemoteClusters();
  };

  $scope.typeFilterOptions = [
    $t('common.any')
  ];

  $scope.currentTypeFilter = $scope.typeFilterOptions[0];

  $scope.clearFilters = function () {
    $scope.currentNameFilter = '';
    $scope.currentTypeFilter = $scope.typeFilterOptions[0];
    $scope.resetPagination();
  };

  function loadRemoteClusters(){
      RemoteCluster.all({
        currentPage: $scope.currentPage,
        groupsPerPage: $scope.groupsPerPage,
        searchString: $scope.currentNameFilter,
        service: $scope.currentTypeFilter
      }).then(function(remoteclusters) {

        $scope.totalGroups = remoteclusters.itemTotal;
        $scope.tableInfo.total = remoteclusters.itemTotal;
        $scope.tableInfo.showed = remoteclusters.items.length;

        $scope.remoteClusters = remoteclusters.items;

        remoteclusters.items.map(function(clusteritem){
          clusteritem.ClusterInfo.services.map(function(service){
            var serviceIndex = $scope.typeFilterOptions.indexOf(service);
            if(serviceIndex == -1){
              $scope.typeFilterOptions.push(service);
            }
          })
        })

      })
      .catch(function(data) {
        console.error('Error in fetching remote clusters.', data);
      });
  };

  loadRemoteClusters();

  $scope.$watch(
    function (scope) {
      return Boolean(scope.currentNameFilter || (scope.currentTypeFilter));
    },
    function (newValue, oldValue, scope) {
      scope.isNotEmptyFilter = newValue;
    }
  );

}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.controller('RemoteClustersEditCtrl', ['$scope', '$modal', '$routeParams', '$location', 'Alert', '$translate', 'Cluster', 'Settings','RemoteCluster', 'DeregisterClusterModal', function($scope, $modal, $routeParams, $location, Alert, $translate, Cluster, Settings, RemoteCluster, DeregisterClusterModal) {
  var $t = $translate.instant;

  $scope.cluster = {};
  $scope.instancesAffected = [];

  $scope.nameValidationPattern = /^\s*\w*\s*$/;

  $scope.openChangePwdDialog = function() {
    var modalInstance = $modal.open({
      templateUrl: 'views/remoteClusters/modals/changePassword.html',
      resolve: {
        clusterId: function() {
          return $scope.cluster.cluster_id;
        },
        clusterName: function() {
          return $scope.cluster.cluster_name;
        },
        clusterUrl: function() {
          return $scope.cluster.cluster_url;
        },
        clusterUser: function() {
          return $scope.cluster.cluster_user;
        }
      },
      controller: ['$scope', 'clusterId' ,'clusterName', 'clusterUrl', 'clusterUser', 'Settings','Alert',  function($scope, clusterId, clusterName, clusterUrl , clusterUser , Settings, Alert) {
        $scope.passwordData = {
          password: '',
          currentUserName: clusterUser || ''
        };

        $scope.form = {};

        $scope.clusterId = clusterId;
        $scope.currentUser = clusterUser;
        $scope.clusterName = clusterName;
        $scope.clusterUrl = clusterUrl;

        $scope.ok = function() {
          $scope.form.passwordChangeForm.submitted = true;


          if ($scope.form.passwordChangeForm.$valid){

            var payload = {
              "ClusterInfo" :{
                "cluster_id" : $scope.clusterId,
                "name" : $scope.clusterName,
                "url" : $scope.clusterUrl,
                "username" : $scope.passwordData.currentUserName,
                "password" : $scope.passwordData.password
              }
            };

            var config = {
              headers : {
                'X-Requested-By': 'Ambari;'
              }
            }

            RemoteCluster.edit(payload, config).then(function(data) {
                Alert.success($t('views.alerts.credentialsUpdated'));
                $scope.form.passwordChangeForm.$setPristine();
              })
              .catch(function(data) {
                console.log(data);
                Alert.error(data.message);
              });

            modalInstance.dismiss('cancel');
          }

        };
        $scope.cancel = function() {
          modalInstance.dismiss('cancel');
        };
      }]
    });
  };

  $scope.deleteCluster = function() {

    $scope.instancesAffected = [];
    RemoteCluster.affectedViews($scope.cluster.cluster_name).then(function(response) {

        response.items.forEach(function(item){
          item.versions.forEach(function(version){
            version.instances.forEach(function(instance){
              $scope.instancesAffected.push(instance.ViewInstanceInfo.instance_name);
            })
          })
        })

        DeregisterClusterModal.show(
          $t('common.deregisterCluster',{term: $t('common.cluster')}),
          $t('common.remoteClusterDelConfirmation', {instanceType: $t('common.cluster').toLowerCase(), instanceName: '"' + $scope.cluster.cluster_name + '"'}),
          $scope.instancesAffected

        ).then(function() {
          RemoteCluster.deregister($scope.cluster.cluster_name).then(function() {
            $location.path('/remoteClusters');
          });
        });
    })
    .catch(function(data) {
      console.log(data);
    });
  };

  $scope.editRemoteCluster = function () {
    $scope.form.submitted = true;
    if ($scope.form.$valid){
      var payload = {
        "ClusterInfo" :{
          "cluster_id" : $scope.cluster.cluster_id,
          "name" : $scope.cluster.cluster_name,
          "url" : $scope.cluster.cluster_url,
          "username" : $scope.cluster.cluster_user
        }
      };

      var config = {
        headers : {
          'X-Requested-By': 'Ambari;'
        }
      }

      RemoteCluster.edit(payload, config).then(function(data) {
          Alert.success($t('views.alerts.savedRemoteClusterInformation'));
          $scope.form.$setPristine();
        })
        .catch(function(data) {
          console.log(data);
          Alert.error(data.message);
        });
    }
  };

  $scope.cancel = function () {
    $scope.editVersionDisabled = true;
    $location.path('/remoteClusters');
  };

  // Fetch remote cluster details
  $scope.fetchRemoteClusterDetails = function (clusterName) {

    RemoteCluster.getDetails(clusterName).then(function(response) {
        $scope.cluster.cluster_id = response.ClusterInfo.cluster_id;
        $scope.cluster.cluster_name = response.ClusterInfo.name;
        $scope.cluster.cluster_url = response.ClusterInfo.url;
        $scope.cluster.cluster_user = response.ClusterInfo.username;
      })
      .catch(function(data) {
        console.log(data);
      });

  };

  $scope.fetchRemoteClusterDetails($routeParams.clusterName);


}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.directive('linkTo', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      route: '@',
      id: '@'
    },

    template: '<a href="#{{href}}" ng-transclude></a>',
    controller: ['$scope', 'ROUTES', function($scope, ROUTES) {
      var route = ROUTES;
      angular.forEach($scope.route.split('.'), function(routeObj) {
        route = route[routeObj];
      });
      $scope.href = route.url.replace(':id', $scope.id);
    }]
  };
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.directive('passwordVerify', function() {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      passwordVerify: '='
    },
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {
        return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.passwordVerify === ctrl.$modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('passwordVerify', currentValue);
      })
    }
  }
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.directive('disabledTooltip', function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs, ctrl) {
      if(!attrs.ngDisabled){
        return;
      }
      scope.$watch(function(scope) {
        return scope[attrs.ngDisabled];
      }, function(val) {
        if(val){
          elem.tooltip({
            title: attrs.disabledTooltip
          });
        } else {
          elem.tooltip('destroy');
        }
      });
    }
  };
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.directive('editableList', ['$q', '$document', '$location', function($q, $document, $location) {
  return {
    restrict: 'E',
    templateUrl: 'views/directives/editableList.html',
    scope: {
      itemsSource: '=',
      resourceType: '@',
      editable: '='
    },
    link: function($scope, $elem, $attr, $ctrl) {
      var $editBox = $elem.find('[contenteditable]');

      var readInput = function() {
        $scope.$apply(function() {
          $scope.input = $editBox.text();
        });
      };

      var isIE = function () {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        // If Internet Explorer, return version number
        if (msie > 0)
          return !!parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));

        // If Internet Explorer 11 handling differently becaue UserAgent string updated by Microsoft
        else if (!!navigator.userAgent.match(/Trident\/7\./))
          return true;
        else
        //If another browser just returning  0
          return false
      };

      $scope.$watch(function() {
        return $scope.input;
      }, function(newValue) {
        if(newValue === ''){
          $scope.clearInput();
        }
      });

      $scope.clearInput = function() {
        $editBox.html('').blur();
      };

      $scope.focusOnInput = function() {
        setTimeout(function() {
          var elem = $editBox[0];
          var selection = window.getSelection(),
              range = document.createRange();
          elem.innerHTML = '\u00a0';
          range.selectNodeContents(elem);

          if(!isIE())
            selection.removeAllRanges();

          selection.addRange(range);
          document.execCommand('delete', false, null);
        }, 0);
      };

      if(isIE()) {
        $editBox.keypress(function(e) {
          $scope.$apply(function() {
            $scope.input = $editBox.text() + e.char;
          })
        });
      }else{
        $editBox.on('input', readInput);
      }

      $editBox.on('keydown', function(e) {
        switch(e.which){
          case 27: // ESC
            $editBox.html('').blur();
            readInput();
            break;
          case 13: // Enter
            $scope.$apply(function() {
              $scope.addItem();
              $scope.focusOnInput();
            });
            return false;
            break;
          case 40: // Down arrow
            $scope.downArrowHandler();
            break;
          case 38: // Up arrow
            $scope.upArrowHandler();
            break;
        }
      });

      $elem.find('.editable-list-container').on('reset', function(event) {
        $scope.editMode = false;
        $scope.items = angular.copy($scope.itemsSource);
        $scope.input = '';
        event.stopPropagation();
      });
    },
    controller: ['$scope', '$injector', '$modal', function($scope, $injector, $modal) {
      var $resource = $injector.get($scope.resourceType);

      $scope.identity = angular.identity; // Sorting function

      $scope.items = angular.copy($scope.itemsSource);
      $scope.editMode = false;
      $scope.input = '';
      $scope.typeahead = [];
      $scope.selectedTypeahed = 0;

      // Watch source of items
      $scope.$watch(function() {
        return $scope.itemsSource;
      }, function(newValue) {
        $scope.items = angular.copy($scope.itemsSource);
      }, true);

      // When input has changed - load typeahead items
      $scope.$watch(function() {
        return $scope.input;
      }, function(newValue) {
        if(newValue){
          var newValue = newValue.split(',').filter(function(i){ 
            i = i.replace('&nbsp;', ''); // Sanitize from spaces
            return !!i.trim();
          }).map(function(i) { return i.trim(); });
          if( newValue.length > 1){
            // If someone paste coma separated string, then just add all items to list
            angular.forEach(newValue, function(item) {
              $scope.addItem(item);
            });
            $scope.clearInput();
            $scope.focusOnInput();
            
          } else {
            // Load typeahed items based on current input
            $resource.listByName(encodeURIComponent(newValue)).then(function(data) {
              var items = [];
              angular.forEach(data.data.items, function(item) {
                var name;
                if($scope.resourceType === 'User'){
                  name = item.Users.user_name;
                } else if($scope.resourceType === 'Group'){
                  name = item.Groups.group_name;
                }
                if($scope.items.indexOf(name) < 0){ // Only if item not in list
                  items.push(name);
                }
              });
              $scope.typeahead = items.slice(0, 5);
              $scope.selectedTypeahed = 0;
            });
          }
        } else {
          $scope.typeahead = [];
          $scope.selectedTypeahed = 0;
          $scope.focusOnInput();
        }
      });

      $scope.enableEditMode = function(event) {
        if( $scope.editable && !$scope.editMode){
          //only one editable-list could be in edit mode at once
          $('.cluster-manage-access-pane div.edit-mode').trigger('reset');
          $scope.editMode = true;
          $scope.focusOnInput();
        }
        event.stopPropagation();
      };

      $scope.cancel = function(event) {
        $scope.editMode = false;
        $scope.items = angular.copy($scope.itemsSource);
        $scope.input = '';
        event.stopPropagation();
      };
      $scope.save = function(event) {
        if( $scope.input ){
          $scope.addItem($scope.input);
        }
        $scope.itemsSource = $scope.items;
        $scope.editMode = false;
        $scope.input = '';
        if(event){
          event.stopPropagation();
        }
      };


      $scope.downArrowHandler = function() {
        $scope.$apply(function() {
          $scope.selectedTypeahed = ($scope.selectedTypeahed+1) % $scope.typeahead.length;
        });
      };
      $scope.upArrowHandler = function() {
        $scope.$apply(function() {
          $scope.selectedTypeahed -= 1;
          $scope.selectedTypeahed = $scope.selectedTypeahed < 0 ? $scope.typeahead.length-1 : $scope.selectedTypeahed;
        });
      };

      $scope.addItem = function(item) {
        item = item ? item : $scope.typeahead.length ? $scope.typeahead[$scope.selectedTypeahed] : $scope.input;
        
        if(item && $scope.items.indexOf(item) < 0){
          $scope.items.push(item);
          $scope.input = '';
        }
      };

      $scope.removeFromItems = function(item) {
        $scope.items.splice( $scope.items.indexOf(item), 1);
      };

      $scope.$on('$locationChangeStart', function(event, targetUrl) {
        targetUrl = targetUrl.split('#').pop();
        if( $scope.input ){
          $scope.addItem($scope.input);
        }
        if( $scope.editMode && !angular.equals($scope.items, $scope.itemsSource)){
          var modalInstance = $modal.open({
            template: '<div class="modal-header"><h3 class="modal-title">{{"common.warning" | translate}}</h3></div><div class="modal-body">{{"common.alerts.unsavedChanges" | translate}}</div><div class="modal-footer"><div class="btn btn-default" ng-click="cancel()">{{"common.controls.cancel" | translate}}</div><div class="btn btn-warning" ng-click="discard()">{{"common.controls.discard" | translate}}</div><div class="btn btn-primary" ng-click="save()">{{"common.controls.save" | translate}}</div></div>',
            controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
              $scope.save = function() {
                $modalInstance.close('save');
              };
              $scope.discard = function() {
                $modalInstance.close('discard');
              };
              $scope.cancel = function() {
                $modalInstance.close('cancel');
              };
            }]
          });
          modalInstance.result.then(function(action) {
            switch(action){
              case 'save':
                $scope.save();
                break;
              case 'discard':
                $scope.editMode = false;
                $location.path(targetUrl);
                break;
            }
          });
          event.preventDefault();
        }
      });
    }]
  };
}]);


/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
/**
 * This service should be used to keep all utility functions in one place that can be used in any controller
 */
angular.module('ambariAdminConsole')
  .factory('Utility', [function() {
    return {
      /**
       *  if version1>= version2 then return true
       *     version1 < version2 then return false
       * @param version1 {String}
       * @param version2 {String}
       * @return boolean
       */
      compareVersions: function(version1, version2) {
        version1 = version1 || '0';
        version2 = version2 || '0';
        var version1Arr = version1.split('.').map(function(item){
          return parseInt(item);
        }).filter(function(item){
          return !!item || item === 0;
        });
        var version2Arr = version2.split('.').map(function(item){
          return parseInt(item);
        }).filter(function(item){
          return !!item || item === 0;
        });
        var totalLength = Math.max(version1Arr.length, version2Arr.length);
        var result = true, i;
        for (i = 0; i <=totalLength; i++) {
          if (version2Arr[i] === undefined) {
            // Example: version1 = "2.3.2.2" and version2 = 2.3.2
            result = true;
            break;
          } else if (version1Arr[i] === undefined) {
            // Example: version1 = "2.3.2" and version2 = "2.3.2.2"
            result = false;
            break;
          } else if (version1Arr[i] > version2Arr[i]) {
            // Example: version1 = "2.3.2.2" and version2 = "2.3.2.1"
            result = true;
            break;
          } else if (version1Arr[i] < version2Arr[i]) {
            // Example: version1 = "2.3.1.2" and version2 = "2.3.2.1"
            result = false;
            break;
          }
        }
        return result;
      }
    };
  }
]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole').constant('UserConstants', {
  /**
   * Available user_types 'values' and 'labels' map.
   */
  TYPES: {
    LOCAL: {
      VALUE: 'LOCAL',
      LABEL_KEY: 'common.local'
    },
    PAM: {
      VALUE: 'PAM',
      LABEL_KEY: 'common.pam'
    },
    LDAP: {
      VALUE: 'LDAP',
      LABEL_KEY: 'common.ldap'
    },
    JWT: {
      VALUE: 'JWT',
      LABEL_KEY: 'common.jwt'
    }
  }
});

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .factory('User', ['Restangular', '$http', 'Settings', 'UserConstants', '$translate', function(Restangular, $http, Settings, UserConstants, $translate) {
  Restangular.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
    var extractedData;
    if(operation === 'getList'){
      extractedData = data.items;
      extractedData.itemTotal = data.itemTotal;
    } else {
      extractedData = data;
    }

    return extractedData;
  });
  var $t = $translate.instant;
  var Users = Restangular.all('users');

  return {
    list: function(params) {
      return $http.get(
        Settings.baseUrl + '/users/?'
        + 'Users/user_name.matches(.*'+params.searchString+'.*)'
        + '&fields=*'
        + '&from=' + (params.currentPage-1)*params.usersPerPage
        + '&page_size=' + params.usersPerPage
        + (params.user_type === '*' ? '' : '&Users/user_type=' + params.user_type)
        + (params.active === '*' ? '' : '&Users/active=' + params.active)
        + (params.admin ? '&Users/admin=true' : '')
      );
    },
    listByName: function(name) {
      return $http.get(
        Settings.baseUrl + '/users?'
        + 'Users/user_name.matches(.*'+name+'.*)'
        + '&from=0&page_size=20'
      );
    },
    get: function(userId) {
      return Restangular.one('users', userId).get();
    },
    create: function(userObj) {
      return Restangular.all('users').post(userObj);
    },
    setActive: function(userId, isActive) {
      return Restangular.one('users', userId).customPUT({'Users/active':isActive});
    },
    setAdmin: function(userId, isAdmin) {
      return Restangular.one('users', userId).customPUT({'Users/admin':isAdmin});
    },
    setPassword: function(user, password, currentUserPassword) {
      return $http({
        method: 'PUT',
        url: Settings.baseUrl + '/users/' + user.user_name,
        data: {
          'Users/password': password,
          'Users/old_password': currentUserPassword
        }
      });
    },
    delete: function(userId) {
      return Restangular.one('users', userId).remove();
    },
    getPrivileges : function(userId) {
      return $http.get(Settings.baseUrl + '/users/' + userId + '/privileges', {
        params:{
          'fields': '*'
        }
      });
    },
    /**
     * Generate user info to display by response data from API.
     * Generally this is a single point to manage all required and useful data
     * needed to use as context for views/controllers.
     *
     * @param {Object} user - object from API response
     * @returns {Object}
     */
    makeUser: function(user) {
      user.Users.encoded_name = encodeURIComponent(user.Users.user_name);
      user.Users.userTypeName = $t(UserConstants.TYPES[user.Users.user_type].LABEL_KEY);
      user.Users.ldap_user = user.Users.user_type === UserConstants.TYPES.LDAP.VALUE;

      return user;
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole').constant('GroupConstants', {
  /**
   * Available group_types 'values' and 'labels' map.
   */
  TYPES: {
    LOCAL: {
      VALUE: 'LOCAL',
      LABEL_KEY: 'common.local'
    },
    PAM: {
      VALUE: 'PAM',
      LABEL_KEY: 'common.pam'
    },
    LDAP: {
      VALUE: 'LDAP',
      LABEL_KEY: 'common.ldap'
    }
  }
});

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('Group', ['$http', '$q', 'Settings', 'GroupConstants', '$translate', function($http, $q, Settings, GroupConstants, $translate) {
  var $t = $translate.instant;
  function Group(item){
    if(typeof item === 'string'){
      this.group_name = item;
    } else if(typeof item === 'object'){
      angular.extend(this, item.Groups);
      this.getMembers();
    }
  }

  Group.prototype.isLDAP = function() {
    var deferred = $q.defer();
    var self = this;
    if( typeof this.ldap_group === 'boolean' ){
      deferred.resolve(this.ldap_group)
    } else {
      $http({
        method: 'GET',
        url: Settings.baseUrl + '/groups/'+this.group_name
      }).
      success(function(data) {
        self.ldap_group = data.Groups.ldap_group;
        deferred.resolve(self.ldap_group);
      });
    }

    return deferred.promise;
  }

  Group.prototype.getGroupType = function() {
    var deferred = $q.defer();
    var self = this;
    $http({
      method: 'GET',
      url: Settings.baseUrl + '/groups/'+this.group_name
    }).
    success(function(data) {
      self.group_type = data.Groups.group_type;
      deferred.resolve(self.group_type);
    });

    return deferred.promise;
  }

  Group.prototype.save = function() {
    return $http({
      method : 'POST',
      url: Settings.baseUrl + '/groups',
      data:{
        'Groups/group_name': this.group_name
      }
    });
  };

  Group.prototype.destroy = function() {
    var deferred = $q.defer();
    $http.delete(Settings.baseUrl + '/groups/' +this.group_name)
    .success(function() {
      deferred.resolve();
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  Group.prototype.getMembers = function() {
    var deferred = $q.defer();
    var self = this;

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/groups/' + this.group_name + '/members'
    })
    .success(function(data) {
      self.members = [];
      angular.forEach(data.items, function(member) {
        self.members.push(member.MemberInfo.user_name);
      });
      deferred.resolve(self.members);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  Group.prototype.saveMembers = function() {
    var self = this;
    var deferred = $q.defer();

    var members = [];
    angular.forEach(this.members, function(member) {
      members.push({
        'MemberInfo/user_name' : member,
        'MemberInfo/group_name' : self.group_name
      });
    });

    $http({
      method: 'PUT',
      url: Settings.baseUrl + '/groups/' + this.group_name + '/members',
      data: members
    })
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  }

  Group.prototype.addMember = function(memberName) {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: Settings.baseUrl + '/groups/' + this.group_name + '/members' + '/'+ encodeURIComponent(member.user_name)
    })
    .success(function(data) {
      deferred.resolve(data)
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  Group.prototype.removeMember = function(memberId) {
    return $http.delete(Settings.baseUrl + '/groups/'+this.group_name+'/members/'+memberId);
  };

  Group.removeMemberFromGroup = function(groupName, memberName) {
    return $http.delete(Settings.baseUrl + '/groups/'+groupName + '/members/'+memberName);
  };

  Group.addMemberToGroup = function(groupName, memberName) {
    return $http.post(Settings.baseUrl + '/groups/' + groupName + '/members/'+memberName);
  };

  Group.all = function(params) {
    var deferred = $q.defer();

    $http.get(Settings.baseUrl + '/groups?'
      + 'Groups/group_name.matches(.*'+params.searchString+'.*)'
      + '&fields=*'
      + '&from='+ (params.currentPage-1)*params.groupsPerPage
      + '&page_size=' + params.groupsPerPage
      + (params.group_type === '*' ? '' : '&Groups/group_type=' + params.group_type)
    )
    .success(function(data) {
      var groups = [];
      if(Array.isArray(data.items)){
        angular.forEach(data.items, function(item) {
          groups.push(new Group(item));
        });
      }
      groups.itemTotal = data.itemTotal;
      deferred.resolve(groups);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  Group.listByName = function(name) {
    return $http.get(Settings.baseUrl + '/groups?'
      + 'Groups/group_name.matches(.*'+name+'.*)'
    );
  };

  Group.getPrivileges = function(groupId) {
    return $http.get(Settings.baseUrl + '/groups/' + groupId + '/privileges', {
      params:{
        'fields': '*'
      }
    });
  };

  /**
     * Generate group info to display by response data from API.
     * Generally this is a single point to manage all required and useful data
     * needed to use as context for views/controllers.
     *
     * @param {Object} group - object from API response
     * @returns {Object}
     */
   Group.makeGroup = function(group) {
      group.groupTypeName = $t(GroupConstants.TYPES[group.group_type].LABEL_KEY);
      return group;
  };

  return Group;
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .factory('RemoteCluster', ['$http', '$q', 'Settings', function($http, $q, Settings) {

    function RemoteCluster(){
    }

    RemoteCluster.edit = function(payload, config){
      var deferred = $q.defer();

      $http.put(Settings.baseUrl + '/remoteclusters/' + payload.ClusterInfo.name , payload, config)
        .success(function (data) {
          deferred.resolve(data)
        })
        .error(function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    }


    RemoteCluster.getDetails = function(clusterName) {
      var deferred = $q.defer();

      $http.get( Settings.baseUrl  + '/remoteclusters/' + clusterName)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    RemoteCluster.deregister = function(clusterName){
      var deferred = $q.defer();

      $http.delete( Settings.baseUrl  + '/remoteclusters/' + clusterName)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;

    };

    RemoteCluster.register = function(payload, config){
      var deferred = $q.defer();

      $http.post(Settings.baseUrl + '/remoteclusters/' + payload.ClusterInfo.name , payload, config)
        .success(function (data) {
          deferred.resolve(data)
        })
        .error(function (data) {
          deferred.reject(data);
        });
        return deferred.promise;
    }

    RemoteCluster.all = function(params) {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + "/remoteclusters?"
          + 'ClusterInfo/name.matches(.*'+params.searchString+'.*)'
          + '&fields=*'
          + '&from='+ (params.currentPage-1)*params.groupsPerPage
          + '&page_size=' + params.groupsPerPage
          + (params.service === 'Any' ? '' : '&ClusterInfo/services.matches(.*'+params.service+'.*)')
        )
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    RemoteCluster.affectedViews = function(clustername) {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + '/views?'
          + 'fields=versions%2Finstances/ViewInstanceInfo/cluster_handle,versions%2Finstances/ViewInstanceInfo/cluster_type&versions%2FViewVersionInfo%2Fsystem=false&versions%2Finstances/ViewInstanceInfo/cluster_type=REMOTE_AMBARI&versions%2Finstances/ViewInstanceInfo/cluster_handle=' + clustername

        )
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    RemoteCluster.listAll = function() {
      var deferred = $q.defer();

      /* TODO :: Add params like RemoteCluster.matches and &from , &page_size */
      $http.get(Settings.baseUrl + "/remoteclusters?fields=ClusterInfo/services,ClusterInfo/cluster_id")
        .success(function(response) {
          deferred.resolve(response.items);
        })
        .error(function(data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };

    return RemoteCluster;

  }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('View', ['$http', '$q', 'Settings', function($http, $q, Settings) {

  function ViewInstance(item){
    angular.extend(this, item);
  }



  ViewInstance.find = function(viewName, version, instanceName) {
    var deferred = $q.defer();
    var fields = [
      'privileges/PrivilegeInfo',
      'ViewInstanceInfo',
      'resources'
    ];

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/'+viewName+'/versions/'+version+'/instances/'+instanceName,
      mock: 'view/views.json',
      params:{
        'fields': fields.join(',')
      }
    })
    .success(function(data) {
      deferred.resolve(new ViewInstance(data));
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };


  function ViewUrl(item) {
    angular.extend(this, item);
  }

  function URLStatus(item){
    angular.element(this,item);
  }

  ViewUrl.all = function(params) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      dataType: "json",
      url: Settings.baseUrl + '/view/urls?'
      + 'ViewUrlInfo/url_name.matches(.*'+params.searchString+'.*)'
      + '&ViewUrlInfo/url_suffix.matches(.*'+params.suffixSearch+'.*)'
      + '&fields=*'
      + '&from=' + (params.currentPage-1)*params.urlsPerPage
      + '&page_size=' + params.urlsPerPage
      + (params.instanceType === '*' ? '' : '&ViewUrlInfo/view_instance_common_name=' + params.instanceType)

    })
        .success(function(data) {
          deferred.resolve(new ViewUrl(data));
        })
        .error(function(data) {
          deferred.reject(data);
        });

    return deferred.promise;
  };


  ViewUrl.updateShortUrl = function(payload){
    var deferred = $q.defer();

    $http({
      method: 'POST',
      dataType: "json",
      url: Settings.baseUrl + '/view/urls/'+payload.ViewUrlInfo.url_name,
      data:payload
    })
        .success(function(data) {
          deferred.resolve(new URLStatus(data));
        })
        .error(function(data) {
          deferred.reject(data);
        });

    return deferred.promise;
  };

  ViewUrl.deleteUrl = function(urlName){
    var deferred = $q.defer();

    $http({
      method: 'DELETE',
      dataType: "json",
      url: Settings.baseUrl + '/view/urls/'+ urlName,
    })
        .success(function(data) {
          deferred.resolve(new URLStatus(data));
        })
        .error(function(data) {
          deferred.reject(data);
        });

    return deferred.promise;
  };


  ViewUrl.editShortUrl = function(payload){
    var deferred = $q.defer();

    $http({
      method: 'PUT',
      dataType: "json",
      url: Settings.baseUrl + '/view/urls/'+payload.ViewUrlInfo.url_name,
      data:payload
    })
        .success(function(data) {
          deferred.resolve(new URLStatus(data));
        })
        .error(function(data) {
          deferred.reject(data);
        });

    return deferred.promise;
  };


  ViewUrl.urlInfo =  function(urlName){

    var deferred = $q.defer();

    $http({
      method: 'GET',
      dataType: "json",
      url: Settings.baseUrl + '/view/urls/'+urlName,

    })
        .success(function(data) {
          deferred.resolve(new ViewUrl(data));
        })
        .error(function(data) {
          deferred.reject(data);
        });

    return deferred.promise;
  };



  function View(item){
    var self = this;
    self.view_name = item.ViewInfo.view_name;
    self.versions = '';
    self.instances = [];
    self.canCreateInstance = false;
    var versions = {};
    angular.forEach(item.versions, function(version) {
      versions[version.ViewVersionInfo.version] = {count: version.instances.length, status: version.ViewVersionInfo.status};
      if(version.ViewVersionInfo.status === 'DEPLOYED'){ // if atelast one version is deployed
        self.canCreateInstance = true;
      }

      angular.forEach(version.instances, function(instance) {
        instance.label = instance.ViewInstanceInfo.label || version.ViewVersionInfo.label || instance.ViewInstanceInfo.view_name;
      });

      self.instances = self.instances.concat(version.instances);
    });
    self.versions = versions;

    self.versionsList = item.versions;
  }

  View.permissionRoles = [
    "CLUSTER.ADMINISTRATOR",
    "CLUSTER.OPERATOR",
    "SERVICE.OPERATOR",
    "SERVICE.ADMINISTRATOR",
    "CLUSTER.USER"
  ];

  View.getInstance = function(viewName, version, instanceName) {
    return ViewInstance.find(viewName, version, instanceName);
  };

  View.allUrls =  function(req){
    return ViewUrl.all(req)
  };

  View.getUrlInfo = function(urlName){
    return ViewUrl.urlInfo(urlName);
  };

  View.deleteUrl = function(urlName){
    return ViewUrl.deleteUrl(urlName);
  };


  View.updateShortUrl = function(payload){
    return ViewUrl.updateShortUrl(payload);
  };

  View.editShortUrl = function(payload){
    return ViewUrl.editShortUrl(payload);
  };

  View.deleteInstance = function(viewName, version, instanceName) {
    return $http.delete(Settings.baseUrl +'/views/'+viewName+'/versions/'+version+'/instances/'+instanceName, {
      headers: {
        'X-Requested-By': 'ambari'
      }
    });
  };

  View.updateInstance = function(viewName, version, instanceName, data) {
    return $http({
      method: 'PUT',
      url: Settings.baseUrl + '/views/' +viewName + '/versions/'+version+'/instances/' + instanceName,
      data: data
    });
  };

  View.getPermissions = function(params) {
    var deferred = $q.defer();

    var fields = [
      'permissions/PermissionInfo/permission_name'
    ];
    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/' + params.viewName + '/versions/'+ params.version,
      params: {
        'fields': fields.join(',')
      }
    }).success(function(data) {
      deferred.resolve(data.permissions);
    })
    .catch(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  View.getPrivileges = function(params) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/' + params.viewName + '/versions/' + params.version + '/instances/' + params.instanceId,
      params: {
        fields: 'privileges/PrivilegeInfo'
      }
    })
    .success(function(data) {
      deferred.resolve(data.privileges);
    })
    .catch(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };



  View.getVersions = function(viewName) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/'+viewName + '?versions/ViewVersionInfo/status=DEPLOYED'
    }).success(function(data) {
      var versions = [];
      angular.forEach(data.versions, function(version) {
        versions.push(version.ViewVersionInfo.version);
      });

      deferred.resolve(versions);
    }).catch(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
  };

  View.createInstance = function(instanceInfo) {
    var deferred = $q.defer(),
      properties = {},
      settings = {},
      data = {
        instance_name: instanceInfo.instance_name,
        label: instanceInfo.label,
        visible: instanceInfo.visible,
        icon_path: instanceInfo.icon_path,
        icon64_path: instanceInfo.icon64_path,
        description: instanceInfo.description
      };

    angular.forEach(instanceInfo.properties, function(property) {
      if(property.clusterConfig) {
        properties[property.name] = property.value
      }else {
        settings[property.name] = property.value
      }
    });

    data.properties = settings;
    data.cluster_type = instanceInfo.clusterType;

    if(instanceInfo.clusterId != null) {
      data.cluster_handle = instanceInfo.clusterId;
    } else {
      angular.extend(data.properties, properties);
    }

    $http({
      method: 'POST',
      url: Settings.baseUrl + '/views/' + instanceInfo.view_name
      +'/versions/'+instanceInfo.version + '/instances/'+instanceInfo.instance_name,
      data:{
        'ViewInstanceInfo' : data
      }
    })
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };

  View.createPrivileges = function(params, data) {
    return $http({
      method: 'POST',
      url: Settings.baseUrl + '/views/' + params.view_name +'/versions/'+params.version+'/instances/'+params.instance_name+'/privileges',
      data: data
    });
  };

  View.deletePrivileges = function(params, data) {
    return $http({
      method: 'DELETE',
      url: Settings.baseUrl + '/views/' + params.view_name +'/versions/'+params.version+'/instances/'+params.instance_name+'/privileges',
      data: data
    });
  };

  View.updatePrivileges = function(params, privileges) {
    return $http({
      method: 'PUT',
      url: Settings.baseUrl + '/views/' + params.view_name +'/versions/'+params.version+'/instances/'+params.instance_name+'/privileges',
      data: privileges
    });
  };

  View.deletePrivilege = function(params) {
    return $http({
      method: 'DELETE',
      url: Settings.baseUrl + '/views/' + params.view_name +'/versions/'+params.version+'/instances/'+params.instance_name+'/privileges/'+params.id
    });
  };

  View.getMeta = function(view_name, version) {
    return $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/'+view_name+'/versions/'+version
    });
  };

  View.checkViewVersionStatus = function(view_name, version) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views/' + view_name + '/versions/' + version,
      params:{
        'fields': 'ViewVersionInfo/status'
      }
    }).then(function(data) {
      deferred.resolve(data.data.ViewVersionInfo.status);
    }).catch(function(err) {
      deferred.reject(err);
    });

    return deferred;
  };

  View.getAllVisibleInstance = function() {
    var deferred = $q.defer();
    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views',
      mock: 'view/views.json',
      params:{
        'fields': 'versions/instances/ViewInstanceInfo',
        'versions/ViewVersionInfo/system': false,
        'versions/instances/ViewInstanceInfo/visible': true
      }
    }).then(function(data) {
      var instances = [];
      data.data.items.forEach(function(view) {
        if (Array.isArray(view.versions)) {
          view.versions.forEach(function(version) {
            version.instances.forEach(function(instance) {
              instances.push(instance.ViewInstanceInfo);
            });
          });
        }
      });
      deferred.resolve(instances);
    });

    return deferred.promise;
  };

  View.all = function() {
    var deferred = $q.defer();
    var fields = [
      'versions/ViewVersionInfo/version',
      'versions/instances/ViewInstanceInfo',
      'versions/*'
    ];

    $http({
      method: 'GET',
      url: Settings.baseUrl + '/views',
      params:{
        'fields': fields.join(','),
        'versions/ViewVersionInfo/system' : false
      }
    }).success(function(data) {
      var views = [];
      angular.forEach(data.items, function(item) {
        views.push(new View(item));
      });
      deferred.resolve(views);
    })
    .error(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  };
  return View;
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('Cluster', ['$http', '$q', 'Settings', function($http, $q, Settings) {
  return {
    repoStatusCache : {},

    orderedRoles : [
      'CLUSTER.ADMINISTRATOR',
      'CLUSTER.OPERATOR',
      'SERVICE.ADMINISTRATOR',
      'SERVICE.OPERATOR',
      'CLUSTER.USER'
    ],

    orderedLevels: ['SERVICE', 'HOST', 'CLUSTER', 'AMBARI'],

    ineditableRoles : ['VIEW.USER', 'AMBARI.ADMINISTRATOR'],

    getAllClusters: function() {
      var deferred = $q.defer();
      $http.get(Settings.baseUrl + '/clusters?fields=Clusters/cluster_id', {mock: 'cluster/clusters.json'})
      .then(function(data, status, headers) {
        deferred.resolve(data.data.items);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getStatus: function() {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + '/clusters?fields=Clusters/provisioning_state', {mock: 'cluster/init.json'})
      .then(function(data, status, headers) {
        deferred.resolve(data.data.items[0]);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getAmbariVersion: function() {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + '/services/AMBARI/components/AMBARI_SERVER?fields=RootServiceComponents/component_version,RootServiceComponents/properties/server.os_family&minimal_response=true', {mock: '2.1'})
      .then(function(data) {
        deferred.resolve(data.data.RootServiceComponents.component_version);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getClusterOS: function() {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + '/services/AMBARI/components/AMBARI_SERVER?fields=RootServiceComponents/properties/server.os_family&minimal_response=true', {mock: 'redhat6'})
      .then(function(data) {
        deferred.resolve(data.data.RootServiceComponents.properties['server.os_family']);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getAmbariTimeout: function() {
      var deferred = $q.defer();
      var url = '/services/AMBARI/components/AMBARI_SERVER?fields=RootServiceComponents/properties/user.inactivity.timeout.default';
      $http.get(Settings.baseUrl + url)
      .then(function(data) {
        var properties = data.data.RootServiceComponents.properties;
        var timeout = properties? properties['user.inactivity.timeout.default'] : 0;
        deferred.resolve(timeout);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getPermissions: function() {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: Settings.baseUrl + '/permissions',
        mock: 'permission/permissions.json',
        params: {
          fields: 'PermissionInfo',
          'PermissionInfo/resource_name': 'CLUSTER'
        }
      })
      .success(function(data) {
        deferred.resolve(data.items);
      })
      .catch(function(data) {
        deferred.reject(data); });

      return deferred.promise;
    },
    getRolesWithAuthorizations: function() {
      var self = this;
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: Settings.baseUrl + '/permissions?PermissionInfo/resource_name.in(CLUSTER,AMBARI)',
        mock: 'permission/permissions.json',
        params: {
          fields: 'PermissionInfo/*,authorizations/AuthorizationInfo/*'
        }
      })
        .success(function(data) {
          deferred.resolve(data.items);
        })
        .catch(function(data) {
          deferred.reject(data); });

      return deferred.promise;
    },

    getPrivileges: function(params) {
      var deferred = $q.defer();

      $http({
        method: 'GET',
        url: Settings.baseUrl + '/clusters/'+params.clusterId,
        params : {
          'fields': 'privileges/PrivilegeInfo'
        }
      })
      .success(function(data) {
        deferred.resolve(data.privileges);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getPrivilegesWithFilters: function(params) {
      var deferred = $q.defer();
      var isUser = params.typeFilter.value == 'USER';
      var endpoint = isUser? '/users' : '/groups';
      var nameURL = isUser? '&Users/user_name.matches(.*' : '&Groups/group_name.matches(.*';
      var nameFilter = params.nameFilter? nameURL + params.nameFilter + '.*)' : '';
      var roleFilter = params.roleFilter.value? '&privileges/PrivilegeInfo/permission_name.matches(.*' + params.roleFilter.value + '.*)' : '';
      $http({
        method: 'GET',
        url: Settings.baseUrl + endpoint + '?'
        + 'fields=privileges/PrivilegeInfo/*'
        + nameFilter
        + roleFilter
        + '&from=' + (params.currentPage - 1) * params.usersPerPage
        + '&page_size=' + params.usersPerPage
      })
      .success(function(data) {
        deferred.resolve(data);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    getPrivilegesForResource: function(params) {
      var deferred = $q.defer();
      var isUser = (params.typeFilter.value == 'USER');
      var endpoint = isUser ? '/users' : '/groups';
      var nameURL = isUser ? '&Users/user_name.matches(' : '&Groups/group_name.matches(';
      var nameFilter = params.nameFilter ? (nameURL + params.nameFilter + ')') : '';
      $http({
        method : 'GET',
        url : Settings.baseUrl + endpoint + '?' + 'fields=privileges/PrivilegeInfo/*' + nameFilter
      })
      .success(function(data) {
        deferred.resolve(data);
      })
      .catch(function(data) {
        deferred.reject(data);
      });

      return deferred.promise;
    },
    createPrivileges: function(params, data) {
      return $http({
        method: 'POST',
        url: Settings.baseUrl + '/clusters/'+params.clusterId+'/privileges',
        data: data
      });
    },
    deletePrivileges: function(params, data) {
      return $http({
        method: 'DELETE',
        url: Settings.baseUrl + '/clusters/'+params.clusterId+'/privileges',
        data: data
      });
    },
    deleteMultiplePrivileges: function(clusterId, privilege_ids) {
      return $http({
        method: 'DELETE',
        url: Settings.baseUrl + '/clusters/'+clusterId+'/privileges?PrivilegeInfo/privilege_id.in\('+privilege_ids+'\)'
      });
    },
    updatePrivileges: function(params, privileges) {
      return $http({
        method: 'PUT',
        url: Settings.baseUrl + '/clusters/' + params.clusterId + '/privileges',
        data: privileges
      });
    },
    deletePrivilege: function(clusterId, id) {
      return $http({
        method: 'DELETE',
        url: Settings.baseUrl + '/clusters/'+clusterId+'/privileges/' + id
      });
    },
    editName: function(oldName, newName) {
      return $http({
        method: 'PUT',
        url: Settings.baseUrl + '/clusters/' + oldName,
        data: {
          Clusters: {
            "cluster_name": newName
          }
        }
      });
    },
    getRepoVersionStatus: function (clusterName, repoId ) {
      var me = this;
      var deferred = $q.defer();
      var url = Settings.baseUrl + '/clusters/' + clusterName +
        '/stack_versions?fields=*&ClusterStackVersions/repository_version=' + repoId;
      $http.get(url, {mock: 'cluster/repoVersionStatus.json'})
      .success(function (data) {
        data = data.items;
        var response = {};
        if (data.length > 0) {
          var hostStatus = data[0].ClusterStackVersions.host_states;
          var currentHosts = hostStatus['CURRENT'].length;
          var installedHosts = hostStatus['INSTALLED'].length;
          var totalHosts = 0;
          // collect hosts on all status
          angular.forEach(hostStatus, function(status) {
            totalHosts += status.length;
          });
          response.status = currentHosts > 0? 'current' :
                            installedHosts > 0? 'installed' : '';
          response.currentHosts = currentHosts;
          response.installedHosts = installedHosts;
          response.totalHosts = totalHosts;
          response.stackVersionId = data[0].ClusterStackVersions.id;
        } else {
          response.status = '';
        }
        me.repoStatusCache[repoId] = response.status;
        deferred.resolve(response);
      })
      .catch(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('Alert', [function() {
  
  var hideTimeout = null;
  var $boxContainer = null;
  var removingTimeout = null;

  function createAlertBox(innerHTML, moreInfo, type){
    if (!$boxContainer) {
      $boxContainer = angular.element('<div class="alert-container"/>').appendTo('body');
      $boxContainer
        .on('mouseenter', function() {
          clearTimeout(removingTimeout);
        })
        .on('mouseleave', function() {
          startRemovingTimeout();
        });
    }
    var elem = angular.element('<div><div class="icon-box"></div></div>').addClass('ambariAlert').addClass(type).addClass('invisible');

    elem.append('<div class="content">' + innerHTML + '</div>');
    if (moreInfo) {
      $(' <a href class="more-collapse"> more...</a>').appendTo(elem.find('.content'))
      .on('click', function() {
        elem.find('.more').show();
        $(this).remove();
        return false;
      });
      elem.append('<div class="more">'+moreInfo.replace(/\./g, '.<wbr />')+'</div>');
    }

    $('<button type="button" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">{{"common.controls.close" | translate}}</span></button>')
      .appendTo(elem)
      .on('click', function() {
        var $box = $(this).closest('.ambariAlert');
        $box.remove();
      });

    var $icon = $('<span class="glyphicon"></span>');
    switch (type){
      case 'error':
        $icon.addClass('glyphicon-remove-sign');
        break;
      case 'success':
        $icon.addClass('glyphicon-ok-sign');
        break;
      case 'info':
        $icon.addClass('glyphicon-info-sign');
        break;
    }
    elem.find('.icon-box').append($icon);

    elem.appendTo($boxContainer);
    setTimeout(function() {
      elem.removeClass('invisible');
    }, 0);

    startRemovingTimeout();
  };

  function startRemovingTimeout(){
    clearTimeout(removingTimeout);
    removingTimeout = setTimeout(removeTopBox, 5000);
  }

  function removeTopBox(){
    $boxContainer.children().first().remove();
    if (!$boxContainer.children().length) {
      $boxContainer.remove();
      $boxContainer = null;
    } else {
      startRemovingTimeout();
    }
  }

  return {
    error: function(innerHTML, moreInfo) {
      createAlertBox(innerHTML, moreInfo, 'error');
    },
    success: function(innerHTML, moreInfo) {
      createAlertBox(innerHTML, moreInfo, 'success');
    },
    info: function(innerHTML, moreInfo) {
      createAlertBox(innerHTML, moreInfo, 'info');
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('PermissionLoader', ['Cluster', 'View', '$q', function(Cluster, View, $q) {
  
  function getPermissionsFor(resource, params){
    var deferred = $q.defer();

    resource.getPermissions(params).then(function(permissions) {
      var permissionsInner = {}; // Save object into closure, until it completely fills to prevent blinkong
      angular.forEach(permissions, function(permission) {
        permission.GROUP = [];
        permission.USER = [];
        permission.ROLE = {};
        angular.forEach(View.permissionRoles, function(key) {
          permission.ROLE[key] = false;
        });
        permissionsInner[permission.PermissionInfo.permission_name] = permission;
      });

      // Now we can get privileges
      resource.getPrivileges(params).then(function(privileges) {
        angular.forEach(privileges, function(privilege) {
          if(privilege.PrivilegeInfo.principal_type == "ROLE") {
            permissionsInner[privilege.PrivilegeInfo.permission_name][privilege.PrivilegeInfo.principal_type][privilege.PrivilegeInfo.principal_name] = true;
          } else {
            permissionsInner[privilege.PrivilegeInfo.permission_name][privilege.PrivilegeInfo.principal_type].push(privilege.PrivilegeInfo.principal_name);
          }
        });

        // After all builded - return object
        deferred.resolve(permissionsInner);
      }).
      catch(function(data) {
        deferred.reject(data);
      });

    })
    .catch(function(data) {
      deferred.reject(data);
    });

    return deferred.promise;
  }

  return {
    getClusterPermissions: function(params) {
      return getPermissionsFor(Cluster, params);
    },
    getViewPermissions: function(params) {
      return getPermissionsFor(View, params);
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('PermissionSaver', ['Cluster', 'View', '$q', 'getDifference', '$translate', function(Cluster, View, $q, getDifference, $translate) {
  var $t = $translate.instant;

  function savePermissionsFor(resource, permissions, params){
    var arr = [];
    angular.forEach(permissions, function(permission) {
      // Sanitaize input
      var users = permission.USER.toString().split(',').filter(function(item) {return item.trim();}).map(function(item) {return item.trim()});
      var groups = permission.GROUP.toString().split(',').filter(function(item) {return item.trim();}).map(function(item) {return item.trim()});
      // Build array
      arr = arr.concat(users.map(function(user) {
        return {
          'PrivilegeInfo':{
            'permission_name': permission.PermissionInfo.permission_name,
            'principal_name': user,
            'principal_type': 'USER'
          }
        }
      }));

      arr = arr.concat(groups.map(function(group) {
        return {
          'PrivilegeInfo':{
            'permission_name': permission.PermissionInfo.permission_name,
            'principal_name': group,
            'principal_type': 'GROUP'
          }
        }
      }));

      angular.forEach(View.permissionRoles, function(key) {
        if(permission.ROLE[key] === true) {
          arr.push({
            'PrivilegeInfo': {
              'permission_name': 'VIEW.USER',
              'principal_name': key,
              'principal_type': 'ROLE'
            }
          });
        }
      });

    });
    if (!passOneRoleCheck(arr)) {
      console.log("CHECK FAILED");
      var deferred = $q.defer();
      deferred.reject({
        data: {
          message: $t('users.roles.oneRolePerUserOrGroup')
        }
      });
      return deferred.promise;
    }
    return resource.updatePrivileges(params, arr);
  }

  function passOneRoleCheck(arr) {
    var hashes = {};
    for(var i = 0; i < arr.length; i++) {
      var obj = arr[i],
        type = obj.PrivilegeInfo.principal_type,
        name = obj.PrivilegeInfo.principal_name;
      if (!hashes[type]) {
        hashes[type] = {};
      }
      if (hashes[type][name] && name !== "*") {
        return false;
      } else {
        hashes[type][name] = true;
      }
    }
    return true;
  }

  return {
    saveClusterPermissions: function(permissions, params) {
      return savePermissionsFor(Cluster, permissions, params);
    },
    saveViewPermissions: function(permissions, params) {
      return savePermissionsFor(View, permissions, params);
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('ConfirmationModal', ['$modal', '$q', '$translate', function($modal, $q, $translate) {

  var $t = $translate.instant;

	return {
		show: function(header, body, confirmText, cancelText, hideCancelButton) {
			var deferred = $q.defer();

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/ConfirmationModal.html',
				controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
					$scope.header = header;
          $scope.isTempalte = !!body.url;
					$scope.body = body;
          $scope.innerScope = body.scope;
          $scope.confirmText = confirmText || $t('common.controls.ok');
          $scope.cancelText = cancelText || $t('common.controls.cancel');
					$scope.showCancelButton = !hideCancelButton;

					$scope.ok = function() {
						$modalInstance.close();
						deferred.resolve();
					};
					$scope.cancel = function() {
						$modalInstance.dismiss();
						deferred.reject();
					};
				}]
			});

      modalInstance.result.then(function() {
        // Gets triggered on close
      }, function() {
        // Gets triggered on dismiss
        deferred.reject();
      });

			return deferred.promise;
		}
	};
}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('DeregisterClusterModal', ['$modal', '$q', '$translate', function($modal, $q, $translate) {

  var $t = $translate.instant;

	return {
		show: function(header, body, remoteInstances, confirmText, cancelText ) {
			var deferred = $q.defer();

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/DeregisterClusterModal.html',
				controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
					$scope.header = header;
          $scope.isTempalte = !!body.url;
					$scope.body = body;
          $scope.innerScope = body.scope;
          $scope.confirmText = confirmText || $t('common.controls.ok');
          $scope.cancelText = cancelText || $t('common.controls.cancel');
					$scope.remoteInstances = remoteInstances || [];

					$scope.ok = function() {
						$modalInstance.close();
						deferred.resolve();
					};
					$scope.cancel = function() {
						$modalInstance.dismiss();
						deferred.reject();
					};
				}]
			});

      modalInstance.result.then(function() {
        // Gets triggered on close
      }, function() {
        // Gets triggered on dismiss
        deferred.reject();
      });

			return deferred.promise;
		}
	};
}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('Auth',['$http', 'Settings', function($http, Settings) {
  var ambari;
  var currentUserName;
  if (localStorage.ambari) {
    ambari = JSON.parse(localStorage.ambari);
    if (ambari && ambari.app && ambari.app.loginName) {
      currentUserName = ambari.app.loginName;
    }
  }
  return {
    signout: function() {
      var data = JSON.parse(localStorage.ambari);
      delete data.app.authenticated;
      delete data.app.loginName;
      delete data.app.user;
      localStorage.ambari = JSON.stringify(data);
      // Workaround for sign off within Basic Authorization
      //commenting this out since using Date.now() in the url causes a security error in IE and does not log out user
      /*var origin = $window.location.protocol + '//' + Date.now() + ':' + Date.now() + '@' +
            $window.location.hostname + ($window.location.port ? ':' + $window.location.port : '');
      return $http({
        method: 'GET',
        url: origin + Settings.baseUrl + '/logout'
      });*/
      //use an invalid username and password in the request header
      $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa('invalid_username:password');
      return $http({
        method: 'GET',
        url: Settings.baseUrl + '/logout'
      });
    },
    getCurrentUser: function() {
    	return currentUserName;
    }
  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('getDifference', [function() {
	return function(oldArr, newArr) {
    var result = {
      add: [],
      del: []
    };
    angular.forEach(newArr, function(item) {
      var itemIndex = oldArr.indexOf(item);
      if(itemIndex >= 0){
        oldArr.splice(itemIndex, 1);
      } else {
        result.add.push(item);
      }
    });

    result.del = oldArr;

    return result;
  };
}]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.service('UnsavedDialog', ['$modal', function($modal) {

	return function(){
		var modalInstance = $modal.open({
      template: '<div class="modal-header"><h3 class="modal-title">{{"common.warning" | translate}}</h3></div><div class="modal-body">{{"common.alerts.unsavedChanges" | translate}}</div><div class="modal-footer"><div class="btn btn-default" ng-click="cancel()">{{"common.controls.cancel" | translate}}</div><div class="btn btn-warning" ng-click="discard()">{{"common.controls.discard" | translate}}</div><div class="btn btn-primary" ng-click="save()">{{"common.controls.save" | translate}}</div></div>',
      controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
        $scope.save = function() {
          $modalInstance.close('save');
        };
        $scope.discard = function() {
          $modalInstance.close('discard');
        };
        $scope.cancel = function() {
          $modalInstance.close('cancel');
        };
      }]
    });
    
    return modalInstance.result;
	};
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('Stack', ['$http', '$q', 'Settings', '$translate', function ($http, $q, Settings,$translate) {
  var $t = $translate.instant,
    statusMap = {
      'INSTALLED': {
        label: $t('versions.installed'),
        class: 'label-default'
      },
      'IN_USE': {
        label: $t('versions.inUse'),
        class: 'label-info'
      },
      'CURRENT': {
        label: $t('versions.current'),
        class: 'label-success'
      }
  };
  /**
   * parse raw json to formatted objects
   * @param data
   * @return {Array}
   */
  function parse(data) {
    data.forEach(function (item) {
      var mapItem = statusMap[item.status];
      if (mapItem) {
        item.statusClass = mapItem.class;
        item.statusLabel = mapItem.label;
      }
    });
    return data;
  }


  function  _parseId(id) {
    return id.replace(/[^\d|\.]/g, '').split('.').map(function (i) {return parseInt(i, 10);});
  }

  return {
    allStackVersions: function () {
      var url = Settings.baseUrl + '/stacks?fields=versions/*';
      var deferred = $q.defer();
      var sortFunction = this.sortByIdAsVersion;
      $http.get(url, {mock: 'stack/allStackVersions.json'})
      .success(function (data) {
        var allStackVersions = [];
        angular.forEach(data.items, function (stack) {
          angular.forEach(stack.versions, function (version) {
            var stack_name = version.Versions.stack_name;
            var stack_version = version.Versions.stack_version;
            var upgrade_packs = version.Versions.upgrade_packs;
            var active = version.Versions.active;
            allStackVersions.push({
              id: stack_name + '-' + stack_version,
              stack_name: stack_name,
              stack_version: stack_version,
              displayName: stack_name + '-' + stack_version,
              upgrade_packs: upgrade_packs,
              active: active
            });
          });
        });
        deferred.resolve(allStackVersions.sort(sortFunction));
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    getGPLLicenseAccepted: function() {
      var deferred = $q.defer();

      $http.get(Settings.baseUrl + '/services/AMBARI/components/AMBARI_SERVER?fields=RootServiceComponents/properties/gpl.license.accepted&minimal_response=true', {mock: 'true'})
        .then(function(data) {
          deferred.resolve(data.data.RootServiceComponents.properties['gpl.license.accepted']);
        })
        .catch(function(data) {
          deferred.reject(data);
        });

      return deferred.promise;
    },
    
    allPublicStackVersions: function() {
      var url = '/version_definitions?fields=VersionDefinition/stack_default,VersionDefinition/type,' +
        'operating_systems/repositories/Repositories/*,VersionDefinition/stack_services,' +
        'VersionDefinition/repository_version&VersionDefinition/show_available=true';
      var deferred = $q.defer();
      $http.get(Settings.baseUrl + url, {mock: 'version/versions.json'})
        .success(function (data) {
          var versions = [];
          angular.forEach(data.items, function(version) {
            var versionObj = {
              id: version.VersionDefinition.id,
              stackName: version.VersionDefinition.stack_name,
              stackVersion: version.VersionDefinition.stack_version,
              stackDefault: version.VersionDefinition.stack_default,
              stackNameVersion:  version.VersionDefinition.stack_name + '-' + version.VersionDefinition.stack_version,
              displayName: version.VersionDefinition.stack_name + '-' + version.VersionDefinition.repository_version.split('-')[0], //HDP-2.3.4.0
              displayNameFull: version.VersionDefinition.stack_name + '-' + version.VersionDefinition.repository_version, //HDP-2.3.4.0-23
              editableDisplayName: version.VersionDefinition.repository_version.substring(4),
              isNonXMLdata: true,
              repositoryVersion: version.VersionDefinition.repository_version,
              stackNameRepositoryVersion: version.VersionDefinition.stack_name + '-' + version.VersionDefinition.repository_version,
              showAvailable: version.VersionDefinition.show_available,
              osList: version.operating_systems,
              updateObj: version
            };
            //hard code to not show stack name box for ECS stack
            if (isNaN(versionObj.editableDisplayName.charAt(0))) {
              versionObj.isNonXMLdata = false;
            }
            var services = [];
            angular.forEach(version.VersionDefinition.stack_services, function (service) {
              // services that should not be shown on UI
              var servicesToExclude = ['GANGLIA', 'KERBEROS', 'MAPREDUCE2'];
              if (servicesToExclude.indexOf(service.name) === -1) {
                services.push({
                  name: service.name,
                  displayName: service.display_name,
                  version: service.versions[0]
                });
              }
            });
            versionObj.services = services.sort(function(a, b){return a.name.localeCompare(b.name)});
            versionObj.osList.forEach(function (os) {
              os.repositories.forEach(function(repo) {
                repo.Repositories.initial_base_url = repo.Repositories.base_url;
              });
            });
            versions.push(versionObj);
          });
          deferred.resolve(versions)
        })
        .error(function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    },

    allRepos: function (filter, pagination) {
      var versionFilter = filter.version;
      var nameFilter = filter.name;
      var typeFilter = filter.type;
      var stackFilter = filter.stack && filter.stack.current && filter.stack.current.value;
      var url = '/stacks?fields=versions/repository_versions/RepositoryVersions';
      if (versionFilter) {
        url += '&versions/repository_versions/RepositoryVersions/repository_version.matches(.*' + versionFilter + '.*)';
      }
      if (nameFilter) {
        url += '&versions/repository_versions/RepositoryVersions/display_name.matches(.*' + nameFilter + '.*)';
      }
      if (typeFilter){
        url += '&versions/repository_versions/RepositoryVersions/type.matches(.*' + typeFilter.toUpperCase() + '.*)';
      }
      if (stackFilter) {
        var stack = filter.stack.current.value.split('-'),
          stackNameFilter = stack[0],
          stackVersionFilter = stack[1];
        url += '&versions/repository_versions/RepositoryVersions/stack_name=' + stackNameFilter;
        url += '&versions/repository_versions/RepositoryVersions/stack_version=' + stackVersionFilter;
      }
      var deferred = $q.defer();
      $http.get(Settings.baseUrl + url, {mock: 'version/versions.json'})
      .success(function (data) {
        var repos = [];
        angular.forEach(data.items, function(stack) {
          angular.forEach(stack.versions, function (version) {
            var repoVersions = version.repository_versions;
            if (repoVersions.length > 0) {
              repos = repos.concat(repoVersions);
            }
          });
        });
        repos = repos.map(function (stack) {
          stack.RepositoryVersions.isPatch = stack.RepositoryVersions.type === 'PATCH';
          stack.RepositoryVersions.isMaint = stack.RepositoryVersions.type === 'MAINT';
          return stack.RepositoryVersions;
        });
        // prepare response data with client side pagination
        var response = {};
        response.itemTotal = repos.length;
        var from = (pagination.currentPage - 1) * pagination.itemsPerPage;
        var to = (repos.length - from > pagination.itemsPerPage)? from + pagination.itemsPerPage : repos.length;
        response.items = repos.slice(from, to);
        response.showed = to - from;
        deferred.resolve(response)
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    addRepo: function (stack, actualVersion, osList) {
      var url = '/stacks/' + stack.stack_name + '/versions/' + stack.stack_version + '/repository_versions/';
      var payload = {};
      var payloadWrap = { RepositoryVersions : payload };
      payload.repository_version = actualVersion;
      payload.display_name = stack.stack_name + '-' + payload.repository_version;
      payloadWrap.operating_systems = [];
      osList.forEach(function (osItem) {
        if (osItem.selected)
        {
          payloadWrap.operating_systems.push({
            "OperatingSystems" : {
              "os_type" : osItem.OperatingSystems.os_type
            },
            "repositories" : osItem.repositories.map(function (repo) {
              return {
                "Repositories" : {
                  "repo_id": repo.Repositories.repo_id,
                  "repo_name": repo.Repositories.repo_name,
                  "base_url": repo.Repositories.base_url
                }
              };
            })
          });
        }
      });
      return $http.post(Settings.baseUrl + url, payloadWrap);
    },

    getRepo: function (repoVersion, stack_name, stack_version) {
      if (stack_version) {
        // get repo by stack version(2.3) and id (112)
        var url = Settings.baseUrl + '/stacks/' + stack_name + '/versions?' +
          'fields=repository_versions/operating_systems/repositories/*' +
          ',repository_versions/operating_systems/OperatingSystems/*' +
          ',repository_versions/RepositoryVersions/*' +
          '&repository_versions/RepositoryVersions/id=' + repoVersion +
          '&Versions/stack_version=' + stack_version;
      } else {
        // get repo by repoVersion (2.3.6.0-2345)
        var url = Settings.baseUrl + '/stacks/' + stack_name + '/versions?' +
          'fields=repository_versions/operating_systems/repositories/*' +
          ',repository_versions/operating_systems/OperatingSystems/*' +
          ',repository_versions/RepositoryVersions/*' +
          '&repository_versions/RepositoryVersions/repository_version=' + repoVersion;
      }
      var deferred = $q.defer();
      $http.get(url, {mock: 'version/version.json'})
      .success(function (data) {
        data = data.items[0];
        var response = {
          id : data.repository_versions[0].RepositoryVersions.id,
          stackVersion : data.Versions.stack_version,
          stackName: data.Versions.stack_name,
          type: data.repository_versions[0].RepositoryVersions.release? data.repository_versions[0].RepositoryVersions.release.type: null,
          stackNameVersion: data.Versions.stack_name + '-' + data.Versions.stack_version, /// HDP-2.3
          actualVersion: data.repository_versions[0].RepositoryVersions.repository_version, /// 2.3.4.0-3846
          version: data.repository_versions[0].RepositoryVersions.release ? data.repository_versions[0].RepositoryVersions.release.version: null, /// 2.3.4.0
          releaseNotes: data.repository_versions[0].RepositoryVersions.release ? data.repository_versions[0].RepositoryVersions.release.release_notes: null,
          displayName: data.repository_versions[0].RepositoryVersions.display_name, //HDP-2.3.4.0
          repoVersionFullName : data.Versions.stack_name + '-' + data.repository_versions[0].RepositoryVersions.repository_version,
          ambari_managed_repositories: data.repository_versions[0].operating_systems[0].OperatingSystems.ambari_managed_repositories !== false,
          osList: data.repository_versions[0].operating_systems,
          updateObj: data.repository_versions[0]
        };
        var services = [];
        angular.forEach(data.repository_versions[0].RepositoryVersions.stack_services, function (service) {
          var servicesToExclude = ['GANGLIA', 'KERBEROS', 'MAPREDUCE2'];
          if (servicesToExclude.indexOf(service.name) === -1) {
            services.push({
              name: service.name,
              version: service.versions[0],
              displayName: service.display_name
            });
          }
        });
        response.services = services.sort(function(a, b){return a.name.localeCompare(b.name)});
        deferred.resolve(response);
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    postVersionDefinitionFile: function (isXMLdata, data, isDryRun) {
      var deferred = $q.defer(),
        url = Settings.baseUrl + '/version_definitions?skip_url_check=true' + (isDryRun ? '&dry_run=true' : ''),
        configs = isXMLdata? { headers: {'Content-Type': 'text/xml'}} : null;

      $http.post(url, data, configs)
        .success(function (response) {
          if (response.resources.length && response.resources[0].VersionDefinition) {
            deferred.resolve(response);
          }
        })
        .error(function (data) {
          deferred.reject(data);
        });
      return deferred.promise;
    },

    updateRepo: function (stackName, stackVersion, id, payload) {
      var url = Settings.baseUrl + '/stacks/' + stackName + '/versions/' + stackVersion + '/repository_versions/' + id;
      var deferred = $q.defer();
      $http.put(url, payload)
      .success(function (data) {
        deferred.resolve(data)
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    deleteRepo: function (stackName, stackVersion, id) {
      var url = Settings.baseUrl + '/stacks/' + stackName + '/versions/' + stackVersion + '/repository_versions/' + id;
      var deferred = $q.defer();
      $http.delete(url)
      .success(function (data) {
        deferred.resolve(data)
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    getSupportedOSList: function (stackName, stackVersion) {
      var url = Settings.baseUrl + '/stacks/' + stackName + '/versions/' + stackVersion + '?fields=operating_systems/repositories/Repositories';
      var deferred = $q.defer();
      $http.get(url, {mock: 'stack/operatingSystems.json'})
      .success(function (data) {
        deferred.resolve(data);
      })
      .error(function (data) {
        deferred.reject(data);
      });
      return deferred.promise;
    },

    validateBaseUrls: function(skip, osList, stack) {
      var deferred = $q.defer(),
        url = Settings.baseUrl + '/stacks/' + stack.stack_name + '/versions/' + stack.stack_version,
        totalCalls = 0,
        invalidUrls = [];

      if (skip) {
        deferred.resolve(invalidUrls);
      } else {
        osList.forEach(function (os) {
          if (os.selected && !os.disabled) {
            os.repositories.forEach(function (repo) {
              totalCalls++;
              $http.post(url + '/operating_systems/' + os.OperatingSystems.os_type + '/repositories/' + repo.Repositories.repo_id + '?validate_only=true',
                {
                  "Repositories": {
                    "base_url": repo.Repositories.base_url,
                    "repo_name": repo.Repositories.repo_name
                  }
                },
                {
                  repo: repo
                }
              )
                .success(function () {
                  totalCalls--;
                  if (totalCalls === 0) deferred.resolve(invalidUrls);
                })
                .error(function (response, status, callback, params) {
                  invalidUrls.push(params.repo);
                  totalCalls--;
                  if (totalCalls === 0) deferred.resolve(invalidUrls);
                });
            });
          }
        });
      }
      return deferred.promise;
    },

    highlightInvalidUrls :function(invalidrepos) {
      invalidrepos.forEach(function(repo) {
        repo.hasError = true;
      });
    },

    /**
     * Callback for sorting models with `id`-property equal to something like version number: 'HDP-1.2.3', '4.2.52' etc
     *
     * @param {{id: string}} obj1
     * @param {{id: string}} obj2
     * @returns {number}
     */
    sortByIdAsVersion: function (obj1, obj2) {
      var id1 = _parseId(obj1.id);
      var id2 = _parseId(obj2.id);
      var lId1 = id1.length;
      var lId2 = id2.length;
      var limit = lId1 > lId2 ? lId2 : lId1;
      for (var i = 0; i < limit; i++) {
        if (id1[i] > id2[i]) {
          return 1;
        }
        if (id1[i] < id2[i]) {
          return -1;
        }
      }
      if (lId1 === lId2) {
        return 0
      }
      return lId1 > lId2 ? 1 : -1;
    },

    filterAvailableServices: function (response) {
      var stackVersion = response.updateObj.RepositoryVersions || response.updateObj.VersionDefinition;
      var nonStandardVersion = stackVersion.type !== 'STANDARD';
      var availableServices = (nonStandardVersion ? stackVersion.services : response.services).map(function (s) {
        return s.name;
      });
      return response.services.filter(function (service) {
        var skipServices = ['MAPREDUCE2', 'GANGLIA', 'KERBEROS'];
        return skipServices.indexOf(service.name) === -1 && availableServices.indexOf(service.name) !== -1;
      }) || [];
    }

  };
}]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .factory('AddRepositoryModal', ['$modal', '$q', function($modal, $q) {
    var modalObject = {};

    modalObject.repoExists = function(existingRepos, repoId) {
      for(var i = existingRepos.length - 1; i >= 0; --i) {
        if (existingRepos[i].Repositories.repo_id === repoId) {
          return true;
        }
      }
      return false;
    };

    modalObject.getRepositoriesForOS = function (osList, selectedOS) {
      // Get existing list of repositories for selectedOS
      for (var i = osList.length - 1; i >= 0; --i) {
        if (osList[i].OperatingSystems.os_type === selectedOS) {
          osList[i].repositories = osList[i].repositories || [];
          return osList[i].repositories;
        }
      }
      return null;
    };

    modalObject.show = function (osList, stackName, stackVersion, repositoryVersionId) {
      var deferred = $q.defer();
      var modalInstance = $modal.open({
        templateUrl: 'views/modals/AddRepositoryModal.html',
        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
          $scope.osTypes = osList.map(function (os) {
            return os.OperatingSystems.os_type;
          });
          $scope.repo = {
            selectedOS: $scope.osTypes[0]
          };

          $scope.add = function (newRepo) {
            var repositoriesForOS = modalObject.getRepositoriesForOS(osList, newRepo.selectedOS);

            // If repo with the same id exists for the selectedOS, show an alert and do not take any action
            $scope.showAlert = modalObject.repoExists(repositoriesForOS, newRepo.id);
            if ($scope.showAlert) {
              return;
            }

            // If no duplicate repository is found on the selectedOS, add the new repository
            repositoriesForOS.push({
              Repositories: {
                repo_id: newRepo.id,
                repo_name: newRepo.name,
                os_type: newRepo.selectedOS,
                base_url: newRepo.baseUrl,
                stack_name: stackName,
                stack_version: stackVersion,
                repository_version_id: repositoryVersionId
              }
            });

            $modalInstance.close();
            deferred.resolve();
          };

          $scope.cancel = function () {
            $modalInstance.dismiss();
            deferred.reject();
          };
        }]
      });
      modalInstance.result.then(function () {
        // Gets triggered on close
      }, function () {
        // Gets triggered on dismiss
        deferred.reject();
      });
      return deferred.promise;
    };

    return modalObject;
  }]);
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
  .factory('AddVersionModal', ['$modal', '$q', function($modal, $q) {
    var modalObject = {};

    modalObject.repoExists = function(existingRepos, repoId) {
      for(var i = existingRepos.length - 1; i >= 0; --i) {
        if (existingRepos[i].Repositories.repo_id === repoId) {
          return true;
        }
      }
      return false;
    };

    modalObject.getRepositoriesForOS = function (osList, selectedOS) {
      // Get existing list of repositories for selectedOS
      for (var i = osList.length - 1; i >= 0; --i) {
        if (osList[i].OperatingSystems.os_type === selectedOS) {
          osList[i].repositories = osList[i].repositories || [];
          return osList[i].repositories;
        }
      }
      return null;
    };

    modalObject.show = function (parentScope) {
      var deferred = $q.defer();
      var modalInstance = $modal.open({
        templateUrl: 'views/modals/AddVersionModal.html',
        controller: ['$scope', '$modalInstance', '$translate', 'Stack', 'Alert', function ($scope, $modalInstance, $translate, Stack, Alert) {
          var $t = $translate.instant;
          $scope.selectedLocalOption = {
            index: 1
          };
          $scope.option1 = {
            index: 1,
            displayName: $t('versions.uploadFile'),
            file: ''
          };
          $scope.option2 = {
            index: 2,
            displayName: $t('versions.enterURL'),
            url: "",
            placeholder: "Enter URL to Version Definition File"
          };
          $scope.readInfoButtonDisabled = function () {
            return $scope.option1.index == $scope.selectedLocalOption.index ? !$scope.option1.file : !$scope.option2.url;
          };
          $scope.onFileSelect = function(e){
            $scope.option1.file = '';
            if (e.files && e.files.length == 1) {
              var file = e.files[0];
              var reader = new FileReader();
              reader.onload = (function () {
                return function (e) {
                  $scope.option1.file = e.target.result;
                  $scope.$apply();
                };
              })(file);
              reader.readAsText(file);
            }
            $scope.$apply();
          };
          /**
           * Load selected file to current page content
           */
          $scope.readVersionInfo = function(){
            var data = {};
            var isXMLdata = false;
            if ($scope.option2.index == $scope.selectedLocalOption.index) {
              var url = $scope.option2.url;
              data = {
                "VersionDefinition": {
                  "version_url": url
                }
              };
            } else if ($scope.option1.index == $scope.selectedLocalOption.index) {
              isXMLdata = true;
              // load from file browser
              data = $scope.option1.file;
            }
            parentScope.isXMLdata = isXMLdata;
            parentScope.data = data;

            return Stack.postVersionDefinitionFile(isXMLdata, data, true).then(function (versionInfo) {
              var repo = versionInfo.resources[0];
              var response = {
                id : repo.VersionDefinition.id,
                stackVersion : repo.VersionDefinition.stack_version,
                stackName: repo.VersionDefinition.stack_name,
                type: repo.VersionDefinition.release? repo.VersionDefinition.release.type: null,
                stackNameVersion: repo.VersionDefinition.stack_name + '-' + repo.VersionDefinition.stack_version, /// HDP-2.3
                stackNameRepositoryVersion: repo.VersionDefinition.stack_name + '-' + repo.VersionDefinition.repository_version,
                actualVersion: repo.VersionDefinition.repository_version, /// 2.3.4.0-3846
                version: repo.VersionDefinition.release ? repo.VersionDefinition.release.version: null, /// 2.3.4.0
                releaseNotes: repo.VersionDefinition.release ? repo.VersionDefinition.release.release_notes: null,
                displayName: repo.VersionDefinition.stack_name + '-' + repo.VersionDefinition.repository_version, //HDP-2.3.4.0
                editableDisplayName: repo.VersionDefinition.repository_version.substring(4),
                isNonXMLdata: !isXMLdata,
                repoVersionFullName : repo.VersionDefinition.stack_name + '-' + repo.VersionDefinition.release ? repo.VersionDefinition.release.version: repo.VersionDefinition.repository_version,
                ambari_managed_repositories: repo.operating_systems[0].OperatingSystems.ambari_managed_repositories !== false,
                osList: repo.operating_systems,
                updateObj: repo
              };
              var services = [];
              angular.forEach(repo.VersionDefinition.stack_services, function (service) {
                var servicesToExclude = ['GANGLIA', 'KERBEROS', 'MAPREDUCE2'];
                if (servicesToExclude.indexOf(service.name) === -1) {
                  services.push({
                    name: service.name,
                    version: service.versions[0],
                    displayName: service.display_name
                  });
                }
              });
              response.services = services.sort(function(a, b){return a.name.localeCompare(b.name)});
              response.osList.forEach(function (os) {
                os.repositories.forEach(function(repo) {
                  repo.Repositories.initial_base_url = repo.Repositories.base_url;
                });
              });

              angular.forEach(parentScope.stackIds, function(stack){
                if (stack.stackNameVersion == response.stackNameVersion) {
                  parentScope.setStackIdActive(stack);
                }
              });
              parentScope.allVersions.push(response);
              angular.forEach(parentScope.allVersions, function(version) {
                var isPublicVersionsExist = false;
                // If public VDF exists for a stack then default base stack version should be hidden
                if (version.stackDefault) {
                  isPublicVersionsExist = parentScope.allVersions.find(function(_version){
                    return (version.stackNameVersion === _version.stackNameVersion && !_version.stackDefault);
                  });
                }
                version.visible = (version.stackNameVersion === response.stackNameVersion) && !isPublicVersionsExist;
              });
              parentScope.activeStackVersion = response;
              parentScope.selectedPublicRepoVersion = response;
              parentScope.setVersionSelected(response);
              $modalInstance.close();
              deferred.resolve();
            }).catch(function (data) {
              Alert.error($t('versions.alerts.readVersionInfoError'), data.message);
            });
          };
          $scope.cancel = function () {
            $modalInstance.dismiss();
            deferred.reject();
          };
        }]
      });
      modalInstance.result.then(function () {
        // Gets triggered on close
      }, function () {
        // Gets triggered on dismiss
        deferred.reject();
      });
      return deferred.promise;
    };

    return modalObject;
  }]);

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('ambariAdminConsole')
.factory('RoleDetailsModal', ['$modal', 'Cluster', function($modal, Cluster) {
  return {
    show: function(roles) {
      roles = roles.map(function(role) {
        role.authorizations = role.authorizations.map(function(authorization) {
          return authorization.AuthorizationInfo;
        });
        var r = role.PermissionInfo;
        r.authorizations = role.authorizations;
        return r;
      });
      var modalInstance = $modal.open({
        templateUrl: 'views/modals/RoleDetailsModal.html',
        size: 'lg',
        controller: function($scope, $modalInstance) {
          var authorizationsOrder;
          $scope.title = '';
          $scope.orderedRoles = ['AMBARI.ADMINISTRATOR'].concat(Cluster.orderedRoles).reverse();
          $scope.orderedLevels = Cluster.orderedLevels;
          $scope.authHash = {};
          $scope.getLevelName = function (key) {
            return key.charAt(0) + key.slice(1).toLowerCase();
          };
          angular.forEach(roles, function (r) {
            angular.forEach(r.authorizations, function (auth) {
              var match = auth.authorization_id.match(/(\w+)\./),
                  levelKey = match && match[1],
                  isLevelDisplayed = $scope.orderedLevels.indexOf(levelKey) !== -1;
              if (isLevelDisplayed) {
                if (!$scope.authHash[levelKey]) {
                  $scope.authHash[levelKey] = {};
                }
                if (!$scope.authHash[levelKey][auth.authorization_id]) {
                  $scope.authHash[levelKey][auth.authorization_id] = {
                    name: auth.authorization_name,
                    roles: {}
                  };
                }
                $scope.authHash[levelKey][auth.authorization_id].roles[r.permission_name] = true;
              }
            });
          });

          // sort authorizations for each level by number of roles permissions
          for (var level in $scope.authHash) {
            if ($scope.authHash.hasOwnProperty(level)) {
              authorizationsOrder = Object.keys($scope.authHash[level]).sort(function (a, b) {
                return Object.keys($scope.authHash[level][b].roles).length - Object.keys($scope.authHash[level][a].roles).length;
              });
              $scope.authHash[level].order = authorizationsOrder;
            }
          }

          $scope.roles = roles.sort(function (a, b) {
            return $scope.orderedRoles.indexOf(a.permission_name) - $scope.orderedRoles.indexOf(b.permission_name);
          });
          $scope.ok = function() {
            $modalInstance.dismiss();
          };
        }
      });
      return modalInstance.result;
    }
  }
}]);