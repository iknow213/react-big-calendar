'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

exports.__esModule = true
exports.default = void 0

var _extends2 = _interopRequireDefault(
  require('@babel/runtime/helpers/extends')
)

var _assertThisInitialized2 = _interopRequireDefault(
  require('@babel/runtime/helpers/assertThisInitialized')
)

var _inheritsLoose2 = _interopRequireDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)

var _propTypes = _interopRequireDefault(require('prop-types'))

var _react = _interopRequireDefault(require('react'))

var _classnames = _interopRequireDefault(require('classnames'))

var _dates = _interopRequireDefault(require('./utils/dates'))

var _chunk = _interopRequireDefault(require('lodash/chunk'))

var _constants = require('./utils/constants')

var _eventLevels = require('./utils/eventLevels')

var _Popup = _interopRequireDefault(require('./Popup'))

var _Overlay = _interopRequireDefault(require('react-overlays/Overlay'))

var _position = _interopRequireDefault(require('dom-helpers/query/position'))

var _reactDom = require('react-dom')

var YearView =
  /*#__PURE__*/
  (function(_React$Component) {
    ;(0, _inheritsLoose2.default)(YearView, _React$Component)

    function YearView() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this =
        _React$Component.call.apply(_React$Component, [this].concat(args)) ||
        this

      _this.renderMonth = function(monthStartDate) {
        var localizer = _this.props.localizer

        var monthDays = _dates.default.visibleDays(monthStartDate, localizer)

        var weeks = (0, _chunk.default)(monthDays, 7)

        var monthLabel = _this.props.localizer.format(monthStartDate, 'MMMM')

        return _react.default.createElement(
          'div',
          {
            className: 'year-month',
            key: monthLabel,
          },
          _react.default.createElement(
            'div',
            {
              className: 'month-header',
            },
            monthLabel
          ),
          _react.default.createElement(
            'div',
            {
              className: 'month-weekdays',
            },
            _this.renderHeaders(weeks[0])
          ),
          _react.default.createElement(
            'div',
            {
              className: 'month-days',
            },
            weeks.map(function(weekDays, key) {
              return _react.default.createElement(
                'div',
                {
                  className: 'year-week',
                  key: key,
                },
                weekDays.map(function(day) {
                  return _this.renderDay(day, monthStartDate)
                })
              )
            })
          )
        )
      }

      _this.renderDay = function(day, monthStartDate) {
        var localizer = _this.props.localizer
        var label = localizer.format(day, 'dateFormat')

        var dayEvents = _this.getDayEvents(day)

        var isOutOfMonth =
          _dates.default.month(day) !== _dates.default.month(monthStartDate)

        if (dayEvents.length && !isOutOfMonth) {
          return _this.renderDayWithEvents(day, label, dayEvents)
        }

        return _react.default.createElement(
          'div',
          {
            className: (0, _classnames.default)('year-day', {
              'out-of-range-day': isOutOfMonth,
            }),
            key: label,
          },
          label
        )
      }

      _this.handleShowMore = function(e, events, date, cell, slot, target) {
        e.preventDefault()
        var popup = _this.props.popup

        if (popup) {
          var position = (0, _position.default)(
            e.target,
            (0, _reactDom.findDOMNode)(
              (0, _assertThisInitialized2.default)(_this)
            )
          )

          _this.setState({
            overlay: {
              date: date,
              events: events,
              position: position,
              target: target,
            },
          })
        }
      }

      _this.getDayEvents = function(date) {
        var key = date.toString()

        if (_this.eventsByDay.has(key)) {
          return _this.eventsByDay.get(key)
        }

        var events = _this.props.events.filter(function(e) {
          return (0,
          _eventLevels.inRange)(e, _dates.default.startOf(date, 'day'), _dates.default.endOf(date, 'day'), _this.props.accessors)
        })

        _this.eventsByDay.set(key, events)

        return events
      }

      _this.state = {
        overlay: null,
      }
      _this.eventsByDay = new Map()
      return _this
    }

    var _proto = YearView.prototype

    _proto.render = function render() {
      var _this2 = this

      var _this$props = this.props,
        date = _this$props.date,
        localizer = _this$props.localizer,
        className = _this$props.className,
        month = _dates.default.visibleDays(date, localizer),
        weeks = (0, _chunk.default)(month, 7)

      var monthRows = (0, _chunk.default)(
        _dates.default.monthsInYear(_dates.default.year(date)),
        4
      )
      this._weekCount = weeks.length
      return _react.default.createElement(
        'div',
        {
          className: (0, _classnames.default)(className),
        },
        monthRows.map(function(row, key) {
          return _react.default.createElement(
            'div',
            {
              className: 'month-row',
              key: key,
            },
            row.map(_this2.renderMonth)
          )
        }),
        this.props.popup && this.renderOverlay()
      )
    }

    _proto.renderHeaders = function renderHeaders(row) {
      var localizer = this.props.localizer
      var first = row[0]
      var last = row[row.length - 1]
      return _dates.default.range(first, last, 'day').map(function(day, idx) {
        return _react.default.createElement(
          'div',
          {
            key: 'header_' + idx,
            className: 'weekday-header',
          },
          localizer.format(day, 'dd')
        )
      })
    }

    _proto.renderDayWithEvents = function renderDayWithEvents(
      day,
      label,
      dayEvents
    ) {
      var _this3 = this

      return _react.default.createElement(
        'a',
        {
          key: label,
          href: '#',
          className: (0, _classnames.default)('year-day', 'with-events'),
          onClick: function onClick(e) {
            return _this3.handleShowMore(e, dayEvents, day)
          },
        },
        label
      )
    }

    _proto.renderOverlay = function renderOverlay() {
      var _this4 = this

      var overlay = (this.state && this.state.overlay) || {}
      var _this$props2 = this.props,
        accessors = _this$props2.accessors,
        localizer = _this$props2.localizer,
        components = _this$props2.components,
        getters = _this$props2.getters,
        selected = _this$props2.selected
      return _react.default.createElement(
        _Overlay.default,
        {
          rootClose: true,
          placement: 'bottom',
          container: this,
          show: !!overlay.position,
          onHide: function onHide() {
            return _this4.setState({
              overlay: null,
            })
          },
          target: function target() {
            return overlay.target
          },
        },
        function(_ref) {
          var props = _ref.props
          return _react.default.createElement(
            _Popup.default,
            (0, _extends2.default)({}, props, {
              accessors: accessors,
              getters: getters,
              selected: selected,
              components: components,
              localizer: localizer,
              position: overlay.position,
              events: overlay.events,
              slotStart: overlay.date,
              slotEnd: overlay.end,
              onSelect: _this4.handleSelectEvent,
              onDoubleClick: _this4.handleDoubleClickEvent,
            })
          )
        }
      )
    }

    return YearView
  })(_react.default.Component)

YearView.propTypes =
  process.env.NODE_ENV !== 'production'
    ? {
        events: _propTypes.default.array.isRequired,
        date: _propTypes.default.instanceOf(Date),
        min: _propTypes.default.instanceOf(Date),
        max: _propTypes.default.instanceOf(Date),
        step: _propTypes.default.number,
        getNow: _propTypes.default.func.isRequired,
        scrollToTime: _propTypes.default.instanceOf(Date),
        rtl: _propTypes.default.bool,
        width: _propTypes.default.number,
        accessors: _propTypes.default.object.isRequired,
        components: _propTypes.default.object.isRequired,
        getters: _propTypes.default.object.isRequired,
        localizer: _propTypes.default.object.isRequired,
        selected: _propTypes.default.object,
        selectable: _propTypes.default.oneOf([true, false, 'ignoreEvents']),
        longPressThreshold: _propTypes.default.number,
        onNavigate: _propTypes.default.func,
        onSelectSlot: _propTypes.default.func,
        onSelectEvent: _propTypes.default.func,
        onDoubleClickEvent: _propTypes.default.func,
        onShowMore: _propTypes.default.func,
        onDrillDown: _propTypes.default.func,
        getDrilldownView: _propTypes.default.func.isRequired,
        popup: _propTypes.default.bool,
        popupOffset: _propTypes.default.oneOfType([
          _propTypes.default.number,
          _propTypes.default.shape({
            x: _propTypes.default.number,
            y: _propTypes.default.number,
          }),
        ]),
      }
    : {}

YearView.range = function(date, _ref2) {
  var localizer = _ref2.localizer

  var start = _dates.default.firstYearVisibleDay(date, localizer)

  var end = _dates.default.lastYearVisibleDay(date, localizer)

  return {
    start: start,
    end: end,
  }
}

YearView.navigate = function(date, action) {
  switch (action) {
    case _constants.navigate.PREVIOUS:
      return _dates.default.add(date, -1, 'year')

    case _constants.navigate.NEXT:
      return _dates.default.add(date, 1, 'year')

    default:
      return date
  }
}

YearView.title = function(date, _ref3) {
  var localizer = _ref3.localizer
  return localizer.format(date, 'YYYY')
}

var _default = YearView
exports.default = _default
module.exports = exports['default']
