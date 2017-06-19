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
 * WITHOUT WARRANTIES   OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.hadoop.yarn.server.applicationhistoryservice.metrics.timeline.uuid;

import org.apache.hadoop.metrics2.sink.timeline.TimelineMetric;
import org.apache.hadoop.yarn.server.applicationhistoryservice.metrics.timeline.aggregators.TimelineClusterMetric;

public interface MetricUuidGenStrategy {

  /**
   * Compute UUID for a given value
   * @param timelineMetric instance
   * @param maxLength
   * @return
   */
//  byte[] computeUuid(TimelineMetric timelineMetric, int maxLength);

  /**
   * Compute UUID for a given value
   * @param value
   * @param maxLength
   * @return
   */
  byte[] computeUuid(TimelineClusterMetric timelineClusterMetric, int maxLength);

  /**
   * Compute UUID for a given value
   * @param value
   * @param maxLength
   * @return
   */
  byte[] computeUuid(String value, int maxLength);

}
