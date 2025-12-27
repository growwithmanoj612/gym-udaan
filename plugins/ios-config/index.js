const { withXcodeProject } = require('@expo/config-plugins');

module.exports = function withIosConfig(config) {
  return withXcodeProject(config, (_config) => {
    const xcodeProject = _config.modResults;
    const groups = xcodeProject.hash.project.objects.PBXGroup;

    // Remove duplicate OneSignalNotificationServiceExtension from Pods or other groups
    for (let key in groups) {
      const group = groups[key];
      if (group.children) {
        group.children = group.children.filter((child) => {
          return child.comment !== 'OneSignalNotificationServiceExtension' || !child.comment;
        });
      }
    }

    return _config;
  });
};