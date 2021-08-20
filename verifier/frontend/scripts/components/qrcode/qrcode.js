(function(){
    window.app.ng.component('qrcode',{
        templateUrl: '/scripts/components/qrcode/qrcode.html',
        bindings: {
            width: '<',
            height: '<',
			data: '<',
            onClick: '&'
        },
        controller: function($scope, $transclude, $element, $window) {
            const ctrl = this;
            this.$onInit = function () {
				new $window.QRCode($element.children()[0],
					{
						'text': ctrl.data,
						'width': ctrl.width,
						'height': ctrl.height
					});
            };
            $scope.onClick = () => {
                ctrl.onClick();
            };
        }
    });
})();
