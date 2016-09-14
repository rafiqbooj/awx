/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

/**
 * @ngdoc function
 * @name controllers.function:Home
 * @description This controller's for the dashboard
*/


/**
 * @ngdoc method
 * @name controllers.function:Home#Home
 * @methodOf controllers.function:Home
 * @description this function loads all the widgets on the dashboard.
 *  dashboardReady (emit) - this is called when the preliminary parts of the dashboard have been loaded, and loads each of the widgets. Note that the
 *                  Host count graph should only be loaded if the user is a super user
 *
*/

export function Home($scope, $compile, $stateParams, $rootScope, $location, $log, Wait,
    ClearScope, Rest, GetBasePath, ProcessErrors, $window, graphData){

    ClearScope('home');

    var dataCount = 0;

    $rootScope.$on('ws-dashboard-jobs', function () {
        Rest.setUrl(GetBasePath('dashboard'));
        Rest.get()
        .success(function (data) {
            $scope.dashboardData = data;
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard host graph data: ' + status });
        });

        Rest.setUrl(GetBasePath("jobs") + "?order_by=-finished&page_size=5&finished__isnull=false");
        Rest.get()
        .success(function (data) {
            $scope.dashboardJobsListData = data.results;
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard jobs list: ' + status });
        });

        Rest.setUrl(GetBasePath("job_templates") + "?order_by=-last_job_run&page_size=5&last_job_run__isnull=false");
        Rest.get()
        .success(function (data) {
            $scope.dashboardJobTemplatesListData = data.results;
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard jobs list: ' + status });
        });

    });

    if ($scope.removeDashboardDataLoadComplete) {
        $scope.removeDashboardDataLoadComplete();
    }
    $scope.removeDashboardDataLoadComplete = $scope.$on('dashboardDataLoadComplete', function () {
        dataCount++;
        if (dataCount === 3) {
            Wait("stop");
            dataCount = 0;
        }
    });

    if ($scope.removeDashboardReady) {
        $scope.removeDashboardReady();
    }
    $scope.removeDashboardReady = $scope.$on('dashboardReady', function (e, data) {
        $scope.dashboardCountsData = data;
        $scope.graphData = graphData;
        $scope.$emit('dashboardDataLoadComplete');

        var cleanupJobListener =
            $rootScope.$on('DataReceived:JobStatusGraph', function(e, data) {
                $scope.graphData.jobStatus = data;
            });

        $scope.$on('$destroy', function() {
            cleanupJobListener();
        });
    });

    if ($scope.removeDashboardJobsListReady) {
        $scope.removeDashboardJobsListReady();
    }
    $scope.removeDashboardJobsListReady = $scope.$on('dashboardJobsListReady', function (e, data) {
        $scope.dashboardJobsListData = data;
        $scope.$emit('dashboardDataLoadComplete');
    });

    if ($scope.removeDashboardJobTemplatesListReady) {
        $scope.removeDashboardJobTemplatesListReady();
    }
    $scope.removeDashboardJobTemplatesListReady = $scope.$on('dashboardJobTemplatesListReady', function (e, data) {
        $scope.dashboardJobTemplatesListData = data;
        $scope.$emit('dashboardDataLoadComplete');
    });

    $scope.refresh = function () {
        Wait('start');
        Rest.setUrl(GetBasePath('dashboard'));
        Rest.get()
        .success(function (data) {
            $scope.dashboardData = data;
            $scope.$emit('dashboardReady', data);
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard: ' + status });
        });
        Rest.setUrl(GetBasePath("jobs") + "?order_by=-finished&page_size=5&finished__isnull=false");
        Rest.get()
        .success(function (data) {
            data = data.results;
            $scope.$emit('dashboardJobsListReady', data);
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard jobs list: ' + status });
        });
        Rest.setUrl(GetBasePath("job_templates") + "?order_by=-last_job_run&page_size=5&last_job_run__isnull=false");
        Rest.get()
        .success(function (data) {
            data = data.results;
            $scope.$emit('dashboardJobTemplatesListReady', data);
        })
        .error(function (data, status) {
            ProcessErrors($scope, data, status, null, { hdr: 'Error!', msg: 'Failed to get dashboard job templates list: ' + status });
        });
    };

    $scope.refresh();
}

Home.$inject = ['$scope', '$compile', '$stateParams', '$rootScope', '$location', '$log','Wait',
    'ClearScope', 'Rest', 'GetBasePath', 'ProcessErrors', '$window', 'graphData'
];
